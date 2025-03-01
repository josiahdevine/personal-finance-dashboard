/**
 * A dedicated handler for CORS preflight requests.
 * This ensures OPTIONS requests are always handled properly,
 * which is essential for cross-origin requests to work.
 * 
 * This handler bypasses all authentication and directly returns CORS headers.
 */

// Dedicated CORS Preflight Handler
// This function handles all OPTIONS preflight requests and ensures proper CORS headers are set

exports.handler = async function(event, context) {
  console.log("CORS Preflight Handler called:", {
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    method: event.httpMethod,
    headers: Object.keys(event.headers),
    timestamp: new Date().toISOString()
  });

  // Always use wildcard origin during debugging
  // Later, change this to specific allowed origins
  const origin = '*';
  
  // Set comprehensive CORS headers for all preflight requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key, X-Environment, X-Request-ID",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin"
  };

  // Important: Always return a 204 status for OPTIONS requests
  // This is the critical part that allows browsers to proceed with the actual request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // This branch should not normally be reached for OPTIONS requests
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "CORS preflight response",
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
}; 