import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { NextResponse } from 'next/server';
import schema from './schema.json';

const formatDocs = (docs: Document[]): string => docs.map(doc => doc.pageContent).join('\n\n');

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

    const vectorstore = await MemoryVectorStore.fromTexts(
      [wikiContent],
      [{ source: 'wikipedia' }],
      embeddings
    );

    const llm = new ChatOpenAI({
      modelName   : 'gpt-4o',
      temperature : 1,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    if (llm.withStructuredOutput == undefined) {
      throw new Error('LLM does not support structured output');
    }

    const llmWithStructuredOutput = llm.withStructuredOutput(schema);

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Analyze this historical figure and feel free to use the following context from Wikipedia: {context}']
    ]);

    const chain = RunnableSequence.from([
      {
        context: async (input: { query: string }) => {
          const docs = await vectorstore.similaritySearch(input.query, 3);

          return formatDocs(docs);
        },
        query: (input: { query: string }) => input.query
      },
      prompt,
      llmWithStructuredOutput
    ]);

    return chain;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error creating analysis chain: ${error.message}`);
    }
    throw new Error('Unknown error occurred while creating analysis chain');
  }
};

export async function POST (request: Request) {
  try {
    const { personName } = await request.json();

    if (!personName) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      );
    }

    const chain = await createAnalysisChain(personName);
    const result = await chain.invoke({ query: personName });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message?.includes('analysis chain')) {
        return NextResponse.json(
          { error: 'External service error' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
