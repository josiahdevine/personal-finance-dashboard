/**
 * API Test Function
 * This function demonstrates that the API subdomain is working correctly
 */

const corsHandler = require('./utils/cors-handler');

exports.handler = async function(event, context) {
  // Get origin and host
  const origin = event.headers.origin || event.headers.Origin || '*';
  const host = event.headers.host || 'unknown';
  
  console.log('API Test Function Called', {
    method: event.httpMethod,
    origin: origin,
    host: host,
    path: event.path,
    headers: event.headers,
    timestamp: new Date().toISOString()
  });

  // Special handler for OPTIONS preflight requests
  if (event.httpMethod === "OPTIONS") {
    console.log('Handling OPTIONS request in api-test');
    const preflightResponse = corsHandler.handleCorsPreflightRequest(event);
    console.log('Preflight Response:', preflightResponse);
    return preflightResponse;
  }

  // For all other requests, return a success response with request details
  const response = {
    statusCode: 200,
    headers: {
      ...corsHandler.getCorsHeaders(origin),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: "API subdomain is working correctly!",
      details: {
        host: host,
        path: event.path,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
        rawPath: event.rawPath,
        rawQuery: event.rawQuery,
        functionPath: context.functionPath,
        functionName: context.functionName,
        netlifyContext: {
          site: process.env.SITE_NAME,
          deployId: process.env.DEPLOY_ID,
          deployUrl: process.env.DEPLOY_URL,
          environment: process.env.NODE_ENV
        }
      }
    })
  };

  console.log('API Test Response:', response);
  return response;
}; 