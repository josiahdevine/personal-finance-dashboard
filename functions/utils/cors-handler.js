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
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://trypersonalfinance.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8888'];

  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes(origin);
  if (!isAllowed && process.env.NODE_ENV === 'production') {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return null;
  }

  return {
    'Access-Control-Allow-Origin': origin || allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Environment, X-Request-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
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
  const corsHeaders = getCorsHeaders(origin);
  
  // If CORS headers are null, return 403
  if (!corsHeaders) {
    return {
      statusCode: 403,
      body: JSON.stringify({ 
        error: 'Origin not allowed',
        message: 'This origin is not authorized to access this resource'
      })
    };
  }

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
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
  const origin = event.headers.origin || event.headers.Origin;
  
  // Return 403 if no origin
  if (!origin) {
    return {
      statusCode: 403,
      body: JSON.stringify({ 
        error: 'Origin required',
        message: 'Origin header is required for this request'
      })
    };
  }
  
  const corsHeaders = getCorsHeaders(origin);
  
  // If CORS headers are null, return 403
  if (!corsHeaders) {
    return {
      statusCode: 403,
      body: JSON.stringify({ 
        error: 'Origin not allowed',
        message: 'This origin is not authorized to access this resource'
      })
    };
  }

  return {
    statusCode: 204,
    headers: corsHeaders,
    body: ''
  };
}

export default {
  getCorsHeaders,
  createCorsResponse,
  handleOptionsRequest
}; 