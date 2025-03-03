/**
 * Rate limiting utility using Redis
 */

const Redis = require('ioredis');
const { createLogger } = require('./logger');

// Initialize logger
const logger = createLogger('rate-limit');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (error) => {
  logger.error('Redis connection error', {
    error: {
      message: error.message,
      type: error.constructor.name
    }
  });
});

/**
 * Check if a request is within rate limits
 * Uses a sliding window with Redis sorted sets
 * @param {string} userId - User ID for rate limiting
 * @param {string} action - Action being rate limited
 * @param {Object} options - Rate limit options
 * @param {number} options.maxRequests - Maximum requests allowed in window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Promise<Object>} Rate limit check result
 */
async function checkLimit(userId, action, options = {}) {
  const {
    maxRequests = 10,
    windowMs = 60000 // 1 minute default
  } = options;

  const now = Date.now();
  const key = `ratelimit:${action}:${userId}`;

  try {
    // Start Redis transaction
    const multi = redis.multi();

    // Remove old entries outside the window
    multi.zremrangebyscore(key, '-inf', now - windowMs);

    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);

    // Get count of requests in window
    multi.zcard(key);

    // Set expiry on the key
    multi.expire(key, Math.ceil(windowMs / 1000));

    // Execute transaction
    const [, , requestCount] = await multi.exec();
    const actualCount = requestCount[1];

    const allowed = actualCount <= maxRequests;
    const remainingRequests = Math.max(0, maxRequests - actualCount);
    const nextAllowedAt = allowed ? null : new Date(now + windowMs);

    logger.debug('Rate limit check', {
      userId,
      action,
      allowed,
      requestCount: actualCount,
      remainingRequests,
      nextAllowedAt
    });

    return {
      allowed,
      remainingRequests,
      nextAllowedAt,
      limit: maxRequests,
      windowMs
    };

  } catch (error) {
    logger.error('Rate limit check error', {
      error: {
        message: error.message,
        type: error.constructor.name
      },
      userId,
      action
    });

    // If Redis fails, allow the request but log the error
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      nextAllowedAt: null,
      limit: maxRequests,
      windowMs,
      error: 'Rate limiting temporarily unavailable'
    };
  }
}

/**
 * Clear rate limit data for a user
 * @param {string} userId - User ID to clear
 * @param {string} action - Action to clear
 * @returns {Promise<boolean>} Success status
 */
async function clearLimit(userId, action) {
  const key = `ratelimit:${action}:${userId}`;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Error clearing rate limit', {
      error: {
        message: error.message,
        type: error.constructor.name
      },
      userId,
      action
    });
    return false;
  }
}

module.exports = {
  checkLimit,
  clearLimit
}; 