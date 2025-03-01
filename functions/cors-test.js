/**
 * CORS Test Function
 * 
 * This function is designed to test CORS handling and provide detailed
 * debugging information about the request. It can be used to verify
 * that CORS is working correctly before testing more complex endpoints.
 */

const corsHandler = require('./utils/cors-handler');

exports.handler = async function(event, context) {
  // Get origin
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  console.log('CORS Test Function Called', {
    method: event.httpMethod,
    origin: origin,
    path: event.path,
    headers: event.headers,
    timestamp: new Date().toISOString()
  });

  // Special handler for OPTIONS preflight requests
  if (event.httpMethod === "OPTIONS") {
    console.log('Handling OPTIONS request in cors-test');
    return corsHandler.handleCorsPreflightRequest(event);
  }

  // For all other requests, return a success response with request details
  return corsHandler.createCorsResponse(200, {
    message: "CORS test successful!",
    details: {
      httpMethod: event.httpMethod,
      path: event.path,
      origin: origin,
      headers: event.headers,
      timestamp: new Date().toISOString()
    },
    cors: {
      headers: corsHandler.getCorsHeaders(origin)
    }
  }, origin);
}; 