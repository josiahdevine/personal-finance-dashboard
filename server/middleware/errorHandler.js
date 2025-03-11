import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, _next) {
  // Log the error
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user.user_id : 'anonymous'
  });
  
  // Determine response status code
  const statusCode = err.statusCode || 500;
  
  // Create error response
  const errorResponse = {
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    status: statusCode,
    requestId: req.requestId
  };
  
  // Add validation errors if available
  if (err.validationErrors) {
    errorResponse.validationErrors = err.validationErrors;
  }
  
  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

export default errorHandler; 