import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import schema from './summarization_schema.json';
import type { HistoricalFigureAnalysis } from './types';

const SYSTEM_PROMPT = `You are an expert historian and analyst. Your task is to extract and organize key information about historical or modern figures from Wikipedia content.

Your analysis should be:
1. Objective in presenting facts
2. Comprehensive in covering different aspects of their life and work
3. Precise in dates and events
4. Balanced in presenting both achievements and controversies
5. Clear in distinguishing between widely accepted facts and disputed claims
6. Thorough and detailed, including as much relevant information as possible for subsequent analysis`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', SYSTEM_PROMPT],
  [
    'user',
    'Please analyze the following Wikipedia content about {personName} and extract structured information according to the schema.\n\nWikipedia content:\n\n{wikiContent}'
  ]
]);

export async function summarizeWikiContent (
  wikiContent: string,
  personName: string
): Promise<HistoricalFigureAnalysis> {
  const modelName = process.env.SUMMARIZATION_MODEL || 'gpt-4o-mini';

  try {
    const llm = new ChatOpenAI({
      modelName,
      temperature : 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY
    }).withStructuredOutput(schema);

    const chain = prompt.pipe(llm);

    const result = (await chain.invoke({
      personName,
      wikiContent
    })) as HistoricalFigureAnalysis;

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to summarize Wikipedia content';

    throw new Error(errorMessage);
  }
}
