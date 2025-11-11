/* eslint-disable no-await-in-loop */
/* eslint-disable max-statements */
/**
 * Fetches from Lambda with retry logic and timeout for cold starts
 * @param url - Lambda URL to fetch from
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Response from Lambda
 */
export async function fetchLambdaWithRetry (
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // For 500 errors (cold starts), use a 10-second timeout
      // For first attempt, use a 30-second timeout
      const timeout = attempt === 1 ? 30000 : 10000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If we get a 500 error (cold start), retry immediately
      if (response.status === 500 && attempt < maxRetries) {
        // eslint-disable-next-line no-console
        console.log(`Lambda cold start detected (attempt ${attempt}/${maxRetries}), retrying...`);

        // Wait 2 seconds before retrying to give Lambda time to warm up
        await new Promise(resolve => setTimeout(resolve, 2000));

        continue;
      }

      // Return response if successful or non-retryable error
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Check if it's a timeout error
      if (lastError.name === 'AbortError') {
        // eslint-disable-next-line no-console
        console.log(`Lambda request timeout (attempt ${attempt}/${maxRetries})`);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));

          continue;
        }
      }

      // If it's not a timeout and not the last attempt, retry
      if (attempt < maxRetries) {
        // eslint-disable-next-line no-console
        console.log(`Lambda request failed (attempt ${attempt}/${maxRetries}):`, lastError.message);

        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

        continue;
      }

      // Last attempt failed, throw error
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript doesn't know that
  throw lastError || new Error('Failed to fetch from Lambda');
}
