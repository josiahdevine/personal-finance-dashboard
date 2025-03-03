/**
 * Retry utility with exponential backoff
 */

const { createLogger } = require('./logger');

// Initialize logger
const logger = createLogger('retry-util');

/**
 * Default shouldRetry function
 * @param {Error} error - The error that occurred
 * @returns {boolean} Whether to retry the operation
 */
function defaultShouldRetry(error) {
  // Retry on network errors or rate limit errors
  return error.code === 'NETWORK_ERROR' ||
         error.response?.status === 429 ||
         error.response?.status >= 500;
}

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} retryCount - Current retry attempt
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(retryCount, initialDelay) {
  // Calculate exponential backoff
  const exponentialDelay = initialDelay * Math.pow(2, retryCount);
  
  // Add random jitter (±10% of delay)
  const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
  
  return exponentialDelay + jitter;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelay - Initial delay in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if retry should occur
 * @param {Function} options.onRetry - Function to call before each retry
 * @returns {Promise} Promise that resolves with the function result
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    shouldRetry = defaultShouldRetry,
    onRetry = () => {}
  } = options;

  let lastError;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (retryCount === maxRetries || !shouldRetry(error)) {
        logger.error('Retry failed', {
          error: {
            message: error.message,
            type: error.constructor.name
          },
          retryCount,
          maxRetries
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = calculateDelay(retryCount, initialDelay);

      logger.warn('Retrying operation', {
        error: {
          message: error.message,
          type: error.constructor.name
        },
        retryCount,
        delay,
        nextRetryIn: `${delay}ms`
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Call onRetry callback
      await onRetry(error, retryCount);

      retryCount++;
    }
  }

  throw lastError;
}

module.exports = retry; 