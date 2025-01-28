/* eslint-disable max-statements */
import { ChatOpenAI } from '@langchain/openai';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { NextResponse } from 'next/server';
import { summarizeWikiContent } from './summarize';
import { getCachedAnalysis, saveAnalysisToCache } from '@/lib/db/queries';
import schema from './analysis_schema.json';

const wikipediaTool = new WikipediaQueryRun({
  topKResults        : 4,
  maxDocContentLength: 40000
});

const llm = new ChatOpenAI({
  modelName   : 'gpt-4o',
  temperature : 1,
  openAIApiKey: process.env.OPENAI_API_KEY
}).withStructuredOutput!(schema);

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'Analyze this historical figure and feel free to use the following context from this Wikipedia summary: {context}']
]);

const hasEnhancedBioMarkers = (content: string, name: string): boolean => {
  const nameRegex = new RegExp(`\\b${name}\\b`, 'i');
  const bioMarkers = [
    /\b(born in|died in|achieved|contributed to|known for)\b/i,
    /\b(\d{4}–\d{4}|\d{4}–present)\b/
  ];

  return nameRegex.test(content) && bioMarkers.some(marker => marker.test(content));
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

    let cachedResult;

    try {
      cachedResult = await getCachedAnalysis(personName);

      if (cachedResult) {
        return NextResponse.json({
          status: 'existing',
          result: cachedResult
        });
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error retrieving cached analysis' },
        { status: 500 }
      );
    }

    let wikiContent: string;

    try {
      wikiContent = await wikipediaTool.invoke(personName);

      if (!hasEnhancedBioMarkers(wikiContent, personName)) {
        return NextResponse.json(
          { error: 'No relevant biography markers found in the Wikipedia entry' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not find Wikipedia entry for this person' },
        { status: 400 }
      );
    }

    let summary;

    try {
      summary = await summarizeWikiContent(wikiContent, personName);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not summarize Wikipedia entry' },
        { status: 400 }
      );
    }

    const chain = RunnableSequence.from([
      {
        context: () => JSON.stringify(summary, null, 2),
        query  : (input: { query: string }) => input.query
      },
      prompt,
      llm
    ]);

    const result = await chain.invoke({ query: personName });

    await saveAnalysisToCache({
      name    : personName,
      analysis: result
    });

    return NextResponse.json({
      status: 'new',
      result
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
