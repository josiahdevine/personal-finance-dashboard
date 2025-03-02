/**
 * CORS Handler Utility
 * Provides standardized CORS handling for Netlify Functions
 */

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8888',
  'https://trypersonalfinance.com',
  'https://www.trypersonalfinance.com',
  'https://personal-finance-dashboard.netlify.app'
];

/**
 * Determine if an origin is allowed
 * @param {string} origin - The requesting origin
 * @returns {boolean} Whether the origin is allowed
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

/**
 * Get the appropriate Access-Control-Allow-Origin value
 * @param {string} origin - The requesting origin
 * @param {boolean} withCredentials - Whether the request includes credentials
 * @returns {string} The appropriate Access-Control-Allow-Origin value
 */
function getAllowedOriginValue(origin, withCredentials = false) {
  // If credentials are included, we must specify the exact origin (not a wildcard)
  if (withCredentials) {
    return isAllowedOrigin(origin) ? origin : null;
  }
  
  // If no credentials, we can use the origin if it's allowed, or a wildcard
  return isAllowedOrigin(origin) ? origin : '*';
}

/**
 * Create a CORS-enabled response
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {string} origin - Requesting origin
 * @param {boolean} withCredentials - Whether the request includes credentials
 * @returns {object} CORS-enabled response object
 */
function createCorsResponse(statusCode, body, origin, withCredentials = true) {
  // Determine the appropriate Access-Control-Allow-Origin value
  const allowOrigin = getAllowedOriginValue(origin, withCredentials);
  
  // Log CORS details for debugging
  console.log('CORS Response:', {
    origin,
    allowOrigin,
    withCredentials,
    statusCode
  });
  
  // If we can't determine a valid origin for a credentials request, return 403
  if (withCredentials && !allowOrigin) {
    console.log(`CORS Error: Origin ${origin} not allowed with credentials`);
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS Error: Origin not allowed with credentials'
      })
    };
  }
  
  // Create headers based on whether credentials are included
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };
  
  // Only add Allow-Credentials header if credentials are included and we have a valid origin
  if (withCredentials && allowOrigin) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 * @param {object} event - Netlify function event
 * @returns {object} Response for OPTIONS request
 */
function handleOptionsRequest(event) {
  const origin = event.headers.origin || event.headers.Origin || '*';
  const withCredentials = true; // Assume credentials for preflight requests
  
  // Determine the appropriate Access-Control-Allow-Origin value
  const allowOrigin = getAllowedOriginValue(origin, withCredentials);
  
  // Log preflight details for debugging
  console.log('CORS Preflight:', {
    origin,
    allowOrigin,
    method: event.httpMethod,
    path: event.path
  });
  
  // If we can't determine a valid origin for a credentials request, return 403
  if (!allowOrigin) {
    console.log(`CORS Preflight Error: Origin ${origin} not allowed with credentials`);
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS Error: Origin not allowed with credentials'
      })
    };
  }
  
  // Create headers for preflight response
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
  
  return {
    statusCode: 204, // No content
    headers
  };
}

// Create a default export object with all the functions
const corsHandler = {
  isAllowedOrigin,
  createCorsResponse,
  handleOptionsRequest
};

export default corsHandler; 