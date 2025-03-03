/**
 * CORS Handler for Netlify Functions
 * Provides utilities for handling CORS headers and preflight requests
 */

/**
 * Get CORS headers for a given origin
 * @param {string} origin - Request origin
 * @returns {object} CORS headers
 */
function getCorsHeaders(origin) {
  // Allow specific origins in production, any in development
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? 'https://trypersonalfinance.com'
    : origin || '*';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Environment, X-Request-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Create a response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {string} origin - Request origin
 * @returns {object} Response object
 */
function createCorsResponse(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(body)
  };
}

/**
 * Handle OPTIONS preflight request
 * @param {object} event - Netlify function event
 * @returns {object} Preflight response
 */
function handleOptionsRequest(event) {
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  return {
    statusCode: 204,
    headers: getCorsHeaders(origin),
    body: ''
  };
}

export default {
  getCorsHeaders,
  createCorsResponse,
  handleOptionsRequest
}; 