/**
 * A dedicated handler for CORS preflight requests.
 * This ensures OPTIONS requests are always handled properly,
 * which is essential for cross-origin requests to work.
 */

// Dedicated CORS Preflight Handler
// This function handles all OPTIONS preflight requests and ensures proper CORS headers are set

exports.handler = async function(event, context) {
  console.log("Handling OPTIONS preflight request:", {
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    method: event.httpMethod
  });

  // Get the requesting origin or default to wildcard
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Set comprehensive CORS headers for preflight requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin"
  };

  // Always return a 204 No Content for OPTIONS requests
  // This is the critical part that allows browsers to proceed with the actual request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // This should not normally be reached for OPTIONS requests
  // but including as a fallback
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "CORS preflight response"
    })
  };
}; 