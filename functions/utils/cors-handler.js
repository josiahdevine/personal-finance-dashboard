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
  // Log the origin for debugging
  console.log(`CORS request received from origin: ${origin}`);

  // For development environments, allow any localhost origin
  if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
    console.log(`Development mode: Allowing localhost origin: ${origin}`);
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-Environment',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };
  }

  // Validate origin against allowed origins
  const allowedOrigins = [
    'https://trypersonalfinance.com',
    'https://www.trypersonalfinance.com',
    'http://localhost:3000',
    'http://localhost:3041',
    'http://localhost:8888',
    'http://localhost:8889'
  ];

  // If origin is not in allowed list, use the first allowed origin as fallback
  const validOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  console.log(`Using valid origin: ${validOrigin}`);

  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-Environment',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
};

/**
 * Handle OPTIONS preflight request
 * @param {object} event - Netlify function event
 * @returns {object} Preflight response or null if not a preflight
 */
const handleCorsPreflightRequest = (event) => {
  if (event.httpMethod !== 'OPTIONS') {
    return null;
  }
  
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log(`Handling preflight request for origin: ${origin}`);
  
  return {
    statusCode: 204,
    headers: getCorsHeaders(origin),
    body: ''
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

module.exports = {
  getCorsHeaders,
  handleCorsPreflightRequest,
  createCorsResponse
}; 