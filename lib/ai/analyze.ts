import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import schema from './analysis_schema.json';
import type { HistoricalFigureAnalysis } from './types';

const SYSTEM_PROMPT = `You are an expert historian and analyst specializing in evaluating historical figures' impact on world history.

Your analysis should:
1. Be objective and evidence-based
2. Consider multiple perspectives and counter-narratives
3. Evaluate impact across different dimensions (reach, innovation, influence, controversy, longevity)
4. Provide detailed personality assessments based on historical records
5. Map geographic and field-specific influence comprehensively
6. Include rich timeline data and major contributions
7. Suggest high-quality additional reading materials
8. Provide balanced sentiment analysis considering both contemporary and modern views

Use the provided Wikipedia summary as your primary source of factual information.`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', SYSTEM_PROMPT],
  [
    'user',
    'Analyze the following historical figure based on this Wikipedia summary. Generate a comprehensive impact analysis with scores, timelines, contributions, and recommendations.\n\nPerson: {personName}\n\nWikipedia Summary:\n\n{context}'
  ]
]);

/**
 * Analyzes a historical figure based on Wikipedia summary context
 * @param context - Stringified JSON of the Wikipedia summary (HistoricalFigureAnalysis from summarization step)
 * @param personName - Name of the historical figure being analyzed
 * @returns Complete historical figure analysis with scores and detailed information
 */
export async function analyzeHistoricalFigure (
  context: string,
  personName: string
): Promise<HistoricalFigureAnalysis> {
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const llm = new ChatOpenAI({
      modelName,
      temperature : 1,
      openAIApiKey: process.env.OPENAI_API_KEY
    }).withStructuredOutput(schema);

    const chain = prompt.pipe(llm);

    const result = (await chain.invoke({
      personName,
      context
    })) as HistoricalFigureAnalysis;

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze historical figure';

    throw new Error(errorMessage);
  }
}
