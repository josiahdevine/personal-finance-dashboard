interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  retryCondition?: (error: any) => boolean;
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  
  let lastError: any;
  
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const isApiError = error instanceof ApiError;
      const isRetryableStatus = isApiError && opts.retryableStatusCodes.includes(error.status);
      const isNetworkError = error instanceof TypeError && error.message === 'Network request failed';
      const passesCustomCondition = opts.retryCondition ? opts.retryCondition(error) : false;
      
      if (!(isRetryableStatus || isNetworkError || passesCustomCondition)) {
        throw error;
      }
      
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      
      const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
      
      console.log(`Retrying operation after ${jitteredDelay}ms. Attempt ${attempt + 1} of ${opts.maxRetries}`);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError;
} 