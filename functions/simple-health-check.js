/**
 * Simple health check endpoint that always returns a healthy status
 * This is a fallback for local development when the database may not be available
 */

exports.handler = async function(event, _context) {
  console.log("Received simple-health-check request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Return a successful health check response
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'healthy',
      message: 'API is up and running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  };
}; 