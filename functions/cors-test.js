/**
 * CORS Test Function
 * This function helps diagnose CORS issues by returning detailed information
 * about the request and the CORS headers being sent back.
 */

const corsHandler = require('./utils/cors-handler');

exports.handler = async function(event, context) {
  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Log the request details for debugging
  console.log('CORS Test Request:', {
    method: event.httpMethod,
    path: event.path,
    origin: origin,
    headers: event.headers,
    queryParams: event.queryStringParameters || {}
  });

  // Handle OPTIONS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return corsHandler.handleCorsPreflightRequest(event);
  }

  // Create a response with detailed information
  const response = {
    success: true,
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    request: {
      method: event.httpMethod,
      path: event.path,
      origin: origin,
      headers: Object.keys(event.headers).reduce((obj, key) => {
        // Don't include authorization tokens in the response
        if (key.toLowerCase() !== 'authorization') {
          obj[key] = event.headers[key];
        } else {
          obj[key] = '(hidden for security)';
        }
        return obj;
      }, {}),
      queryParams: event.queryStringParameters || {}
    },
    cors: {
      allowedOrigins: [
        'https://trypersonalfinance.com',
        'https://www.trypersonalfinance.com',
        'https://api.trypersonalfinance.com',
        'http://localhost:3000'
      ],
      responseOrigin: corsHandler.getCorsHeaders(origin)['Access-Control-Allow-Origin'],
      withCredentials: true
    },
    environment: {
      node_env: process.env.NODE_ENV || '(not set)',
      netlify: process.env.NETLIFY || '(not set)'
    }
  };

  // Return the response with CORS headers
  return corsHandler.createCorsResponse(200, response, origin);
}; 