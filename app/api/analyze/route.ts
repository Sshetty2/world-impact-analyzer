/* eslint-disable id-length */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { search } from 'fast-fuzzy';

import { auth } from '@/app/(auth)/auth';
import { analyzeHistoricalFigure } from '@/lib/ai/analyze';
import { fetchLambdaWithRetry } from '@/lib/ai/fetchLambdaWithRetry';
import { getCachedAnalysis, saveAnalysisToCache, saveChat } from '@/lib/db/queries';
import { summarizeWikiContent } from '@/lib/ai/summarize';
import type {
  AnalyzeErrorResponse,
  AnalyzeResponse,
  HistoricalFigureAnalysis
} from '@/lib/ai/types';

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

const hasEnhancedBioMarkers = (content: string, name: string): boolean => {
  const FUZZY_THRESHOLD = 0.72;

  // Check for biographical markers
  const bioMarkers = [
    /\b(born in|died in|achieved|contributed to|known for|early life)\b/i,
    /\b(\d{4}–\d{4}|\d{4}–present)\b/
  ];

  const hasBioMarkers = bioMarkers.some(marker => marker.test(content));

  // Use fuzzy matching to find the name in the content
  // Split content into words and create n-grams (1-4 words) to match against the name
  const words = content.split(/\s+/);
  const nameWordCount = name.split(/\s+/).length;
  const maxNGram = Math.min(nameWordCount + 2, 6); // Allow some flexibility

  let nameFound = false;

  for (let n = 1; n <= maxNGram && !nameFound; n++) {
    for (let i = 0; i <= words.length - n && !nameFound; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      const matches = search(name, [phrase], { threshold: FUZZY_THRESHOLD });

      if (matches.length > 0) {
        nameFound = true;
      }
    }
  }

  return nameFound && hasBioMarkers;
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

    // 2️⃣ Fetch Wikipedia Data via Lambda Proxy with retry logic
    let wikiContent: string;

    try {
      const lambdaUrl = `${process.env.AWS_LAMBDA_GATEWAY_URL}/world-impact-analysis`;

      if (!lambdaUrl) {
        throw new Error('AWS_LAMBDA_GATEWAY_URL is not configured');
      }

      const lambdaResponse = await fetchLambdaWithRetry(lambdaUrl, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ personName })
      });

      if (!lambdaResponse.ok) {
        throw new Error(`Lambda returned status ${lambdaResponse.status}`);
      }

      const lambdaData = await lambdaResponse.json();

      if (!lambdaData.success || !lambdaData.content) {
        throw new Error(lambdaData.error || 'Lambda failed to fetch Wikipedia content');
      }

      wikiContent = lambdaData.content;

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
    let result: HistoricalFigureAnalysis;

    try {
      result = await analyzeHistoricalFigure(
        JSON.stringify(summary, null, 2),
        personName
      );
    } catch (error) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: error instanceof Error ? error.message : 'Could not analyze historical figure' },
        { status: 400 }
      );
    }

    // 5️⃣ Cache and Return Result
    // Use the LLM's returned name as the cache key, not the user's input
    await saveAnalysisToCache({
      name    : result.name,
      analysis: result
    });

    // Create the Chat record so it exists when /api/chat is called
    await saveChat({
      id                : chatId,
      userId            : session.user?.id || '',
      title             : result.name,
      analyzedPersonName: result.name
    });

    return NextResponse.json<AnalyzeResponse>({
      status: 'new',
      result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis';

    return NextResponse.json<AnalyzeErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
