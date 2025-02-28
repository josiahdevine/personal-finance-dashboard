/**
 * Shared CORS Handler for Netlify Functions
 * This module provides standardized CORS handling for all API functions
 */

/**
 * Generate standardized CORS headers
 * @param {string} origin - The request origin or '*' as fallback
 * @param {string[]} [methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']] - Allowed HTTP methods
 * @param {boolean} [credentials=true] - Whether to allow credentials
 * @returns {object} - Object containing CORS headers
 */
function getCorsHeaders(origin = '*', methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], credentials = true) {
  // List of allowed origins in production
  const allowedOrigins = [
    'https://trypersonalfinance.com',
    'https://www.trypersonalfinance.com',
    'http://localhost:3000'
  ];

  // In production, only allow specific origins
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? allowedOrigins.includes(origin) ? origin : 'https://trypersonalfinance.com'
    : '*';
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key, X-Environment, X-Request-ID",
    "Access-Control-Allow-Methods": methods.join(', '),
    "Access-Control-Allow-Credentials": credentials ? "true" : "false",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin",
    "Cache-Control": "no-cache"
  };
}

/**
 * Handle CORS preflight requests (OPTIONS method)
 * @param {object} event - The Netlify function event
 * @returns {object|null} - Response object for OPTIONS requests, null for other methods
 */
function handleCorsPreflightRequest(event) {
  const origin = event.headers.origin || event.headers.Origin || '*';

  // For OPTIONS method, return 204 No Content with CORS headers
  if (event.httpMethod === "OPTIONS") {
    console.log(`Handling OPTIONS preflight request for ${event.path}`, {
      origin,
      path: event.path
    });
    
    return {
      statusCode: 204,
      headers: getCorsHeaders(origin),
      body: ""
    };
  }

  // For non-OPTIONS methods, return null to continue normal processing
  return null;
}

/**
 * Create a CORS response
 * @param {number} statusCode - HTTP status code
 * @param {object|string} body - Response body (will be stringified if object)
 * @param {string} origin - Request origin
 * @param {object} [additionalHeaders={}] - Additional headers to include
 * @returns {object} - Formatted response with CORS headers
 */
function createCorsResponse(statusCode, body, origin = '*', additionalHeaders = {}) {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  
  // Combine CORS headers with additional headers and ensure Content-Type is set
  const headers = {
    ...getCorsHeaders(origin),
    "Content-Type": "application/json",
    ...additionalHeaders
  };
  
  return {
    statusCode,
    headers,
    body: responseBody
  };
}

module.exports = {
  getCorsHeaders,
  handleCorsPreflightRequest,
  createCorsResponse
}; 