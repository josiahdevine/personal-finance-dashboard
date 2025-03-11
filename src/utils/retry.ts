import logger from './logger';

/**
 * Configuration options for the retry function
 */
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Default configuration for retry
 */
const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    // Don't retry on 4xx client errors (except 429 Too Many Requests)
    if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
      return false;
    }
    return true;
  }
};

/**
 * Utility function that retries a function that returns a promise
 * with exponential backoff
 * 
 * @param fn The function to retry
 * @param options Retry configuration options
 * @returns Promise with the result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, initialDelay, backoffFactor, shouldRetry } = {
    ...defaultOptions,
    ...options
  };

  let retries = 0;

  async function attempt(): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // Check if we should retry
      if (retries >= maxRetries || (shouldRetry && !shouldRetry(error))) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(backoffFactor, retries);
      
      logger.warn(
        'Retry', 
        `Retrying failed request (attempt ${retries + 1}/${maxRetries})`,
        { delay, error }
      );

      // Increment retries before waiting
      retries++;

      // Wait and then retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt();
    }
  }

  return attempt();
} 