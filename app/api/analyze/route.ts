import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnablePassthrough } from '@langchain/core/runnables';
import { NextResponse } from 'next/server';
import schema from './schema.json';

const formatDocs = (docs: any[]): string => docs.map(doc => doc.pageContent).join('\n\n');

const createAnalysisChain = async (personName: string) => {
  try {
    const wikipediaTool = new WikipediaQueryRun({
      topKResults        : 2,
      maxDocContentLength: 4000
    });
    const wikiContent = await wikipediaTool.invoke(personName);

    const embeddings = new OpenAIEmbeddings({
      modelName   : 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const documents = [{
      pageContent: wikiContent,
      metadata   : {}
    }];
    const vectorstore = await FaissStore.fromDocuments(
      documents,
      embeddings
    );

    const llm = new ChatOpenAI({
      modelName   : 'gpt-4',
      temperature : 1,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    if (llm.withStructuredOutput === undefined) {
      throw new Error('LLM does not support structured output');
    }

    llm.withStructuredOutput(schema);

    // Create prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are an expert at analyzing historical figures and their impact on the world.'],
      ['system', 'Using the following Wikipedia content, provide a structured assessment following the exact schema provided: {context}']
    ]);

    // Create the chain
    const chain = RunnablePassthrough.assign({
      context: async (input: { query: string }) => {
        const docs = await vectorstore.similaritySearch(input.query, 3);

        return formatDocs(docs);
      }
    }).pipe(prompt)
      .pipe(llm);

    return chain;
  } catch (error: any) {
    throw new Error('Error creating analysis chain:', error);
  }
};

export async function POST (request: Request) {
  try {
    // Extract person name from request body
    const { personName } = await request.json();

    if (!personName) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      );
    }

    // Create and invoke the chain
    const chain = await createAnalysisChain(personName);
    const result = await chain.invoke({ query: personName });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Handle external service errors (Wikipedia, OpenAI) with 502
    if (error.message?.includes('analysis chain')) {
      return NextResponse.json(
        { error: 'External service error' },
        { status: 502 }
      );
    }

    // Generic error response for unhandled cases
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
