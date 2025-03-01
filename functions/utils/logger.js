/**
 * Simple logger utility for Netlify Functions
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Creates a logger instance with the given context
 * @param {string} context - The context/name for the logger
 * @returns {Object} Logger instance with logging methods
 */
function createLogger(context) {
  const logWithLevel = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      context,
      message,
      ...data,
      environment: process.env.NODE_ENV || 'development'
    };

    // Remove sensitive data
    if (logData.headers?.authorization) {
      logData.headers.authorization = '[REDACTED]';
    }
    if (logData.headers?.['x-api-key']) {
      logData.headers['x-api-key'] = '[REDACTED]';
    }

    // Use appropriate console method based on level
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(JSON.stringify(logData));
        break;
      case LOG_LEVELS.WARN:
        console.warn(JSON.stringify(logData));
        break;
      case LOG_LEVELS.DEBUG:
        if (process.env.NODE_ENV !== 'production') {
          console.debug(JSON.stringify(logData));
        }
        break;
      default:
        console.log(JSON.stringify(logData));
    }
  };

  return {
    error: (message, data) => logWithLevel(LOG_LEVELS.ERROR, message, data),
    warn: (message, data) => logWithLevel(LOG_LEVELS.WARN, message, data),
    info: (message, data) => logWithLevel(LOG_LEVELS.INFO, message, data),
    debug: (message, data) => logWithLevel(LOG_LEVELS.DEBUG, message, data)
  };
}

module.exports = {
  createLogger,
  LOG_LEVELS
}; 