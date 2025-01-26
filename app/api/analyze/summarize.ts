import OpenAI from 'openai';
import schema from './summarization_schema.json';

const summarizationClient = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey : process.env.DEEPSEEK_API_KEY
});

const generateSystemPrompt = (wikiContent: string, personName: string) => `Please extract and organize key information about this historical or modern figure: ${personName}.

Your task is to read through Wikipedia content and create a structured analysis that captures the essence of the person's life, work, and impact.

Please be:
1. Objective in presenting facts
2. Comprehensive in covering different aspects of their life and work
3. Precise in dates and events
4. Balanced in presenting both achievements and controversies
5. Clear in distinguishing between widely accepted facts and disputed claims
6. Please be as thorough and detailed as possible, and include as much information as you deem relevant for a subsequent analysis.

The output should follow the provided JSON schema exactly:

${JSON.stringify(schema, null, 2)}

Wikipedia content:

${wikiContent}`;

export async function summarizeWikiContent (wikiContent: string, personName: string) {
  try {
    const completion = await summarizationClient.chat.completions.create({
      model   : 'deepseek-chat',
      messages: [
        {
          role   : 'system',
          content: generateSystemPrompt(wikiContent, personName)
        }
      ],
      temperature    : 0.3,
      response_format: { type: 'json_object' },
      seed           : 42
    });

    const summary = completion.choices[0].message.content;

    if (!summary) {
      throw new Error('No summary generated');
    }

    return JSON.parse(summary);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to summarize Wikipedia content');
  }
}
