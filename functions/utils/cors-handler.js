/**
 * CORS Handler for Netlify Functions
 * Provides utilities for handling CORS headers and preflight requests
 */

/**
 * Get CORS headers for a given origin
 * @param {string} origin - Request origin
 * @returns {object} CORS headers
 */
const getCorsHeaders = (origin) => {
  // Validate origin against allowed origins
  const allowedOrigins = [
    'https://trypersonalfinance.com',
    'https://www.trypersonalfinance.com',
    'http://localhost:3000',
    'http://localhost:8888'
  ];

  // If origin is not in allowed list, use the first allowed origin as fallback
  const validOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
};

/**
 * Create a response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {string} origin - Request origin
 * @returns {object} Response object
 */
const createCorsResponse = (statusCode, body, origin) => {
  return {
    statusCode,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
};

/**
 * Handle OPTIONS preflight request
 * @param {object} event - Netlify function event
 * @returns {object} Preflight response
 */
const handleCorsPreflightRequest = (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  
  return {
    statusCode: 204,
    headers: getCorsHeaders(origin)
  };
};

export default {
  getCorsHeaders,
  handleCorsPreflightRequest,
  createCorsResponse
}; 