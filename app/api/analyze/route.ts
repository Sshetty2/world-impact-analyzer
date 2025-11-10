import { ChatOpenAI } from '@langchain/openai';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { getCachedAnalysis, saveAnalysisToCache, saveChat } from '@/lib/db/queries';

import schema from './analysis_schema.json';
import { summarizeWikiContent } from './summarize';
import type {
  AnalyzeErrorResponse,
  AnalyzeResponse,
  HistoricalFigureAnalysis
} from './types';

export const maxDuration = 60;

const RequestSchema = z.object({
  personName: z
    .string()
    .min(1, 'Person name is required')
    .max(100, 'Person name is too long')
    .trim(),
  chatId: z
    .string()
    .uuid('Valid chat ID is required')
});

const wikipediaTool = new WikipediaQueryRun({
  topKResults        : 4,
  maxDocContentLength: 7000

  // Don't override baseUrl - let LangChain use its default Wikipedia API endpoint
});

const llm = new ChatOpenAI({
  modelName   : process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature : 1,
  openAIApiKey: process.env.OPENAI_API_KEY
}).withStructuredOutput(schema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Analyze this historical figure and feel free to use the following context from this Wikipedia summary: {context}'
  ]
]);

const hasEnhancedBioMarkers = (content: string, name: string): boolean => {
  const nameRegex = new RegExp(`\\b${name}\\b`, 'i');
  const bioMarkers = [
    /\b(born in|died in|achieved|contributed to|known for)\b/i,
    /\b(\d{4}–\d{4}|\d{4}–present)\b/
  ];

  return nameRegex.test(content) && bioMarkers.some(marker => marker.test(content));
};

// eslint-disable-next-line max-statements
export async function POST (request: Request) {
  // Check authentication
  const session = await auth();

  if (!session) {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map(error => error.message)
        .join(', ');

      return NextResponse.json<AnalyzeErrorResponse>(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { personName, chatId } = validation.data;

    // 1️⃣ Check Cache
    try {
      const cachedResult = await getCachedAnalysis(personName);

      if (cachedResult) {
        return NextResponse.json<AnalyzeResponse>({
          status: 'existing',
          result: cachedResult as HistoricalFigureAnalysis
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Cache error:', error);

      // Continue to analysis if cache fails
    }

    // 2️⃣ Fetch Wikipedia Data
    let wikiContent: string;

    try {
      // eslint-disable-next-line no-console
      console.log('Fetching Wikipedia data for:', personName);
      wikiContent = await wikipediaTool.invoke(personName);

      // eslint-disable-next-line no-console
      console.log('Wikipedia content received, length:', wikiContent?.length);

      if (!wikiContent || wikiContent.length === 0) {
        return NextResponse.json<AnalyzeErrorResponse>(
          { error: 'Wikipedia returned empty content' },
          { status: 400 }
        );
      }

      if (!hasEnhancedBioMarkers(wikiContent, personName)) {
        return NextResponse.json<AnalyzeErrorResponse>(
          { error: 'No relevant biography markers found in Wikipedia entry' },
          { status: 400 }
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Wikipedia fetch error details:', error);

      const errorMessage = error instanceof Error ? error.message : 'Could not find Wikipedia entry for this person';

      return NextResponse.json<AnalyzeErrorResponse>(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // 3️⃣ Summarize Wikipedia Content
    let summary: HistoricalFigureAnalysis;

    try {
      summary = await summarizeWikiContent(wikiContent, personName);
    } catch (error) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: error instanceof Error ? error.message : 'Could not summarize Wikipedia entry' },
        { status: 400 }
      );
    }

    // 4️⃣ Run AI Analysis
    const chain = RunnableSequence.from([
      {
        context: () => JSON.stringify(summary, null, 2),
        query  : (input: { query: string }) => input.query
      },
      prompt,
      llm
    ]);

    const result = (await chain.invoke({ query: personName })) as any;

    // 5️⃣ Cache and Return Result
    // Use the LLM's returned name as the cache key, not the user's input
    // The structured output returns data with a 'properties' wrapper
    const nameKey = result.properties?.name || result.name;

    // eslint-disable-next-line no-console
    console.log('Saving analysis with name key:', nameKey);

    await saveAnalysisToCache({
      name    : nameKey,
      analysis: result
    });

    // eslint-disable-next-line no-console
    console.log('Creating chat with name key:', nameKey);

    // Create the Chat record so it exists when /api/chat is called
    await saveChat({
      id                : chatId,
      userId            : session.user.id,
      title             : nameKey,
      analyzedPersonName: nameKey
    });

    return NextResponse.json<AnalyzeResponse>({
      status: 'new',
      result
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis';

    return NextResponse.json<AnalyzeErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
