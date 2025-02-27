/**
 * A diagnostic handler for debugging CORS and request issues
 */

exports.handler = async function(event, context) {
  // Log all request details
  console.log("CORS Debug Request:", {
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    method: event.httpMethod,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
    multiValueQueryStringParameters: event.multiValueQueryStringParameters,
    body: event.body ? '(Body exists)' : '(No body)',
    isBase64Encoded: event.isBase64Encoded,
    rawUrl: event.rawUrl,
    routeKey: event.routeKey
  });

  // Get the requesting origin or default to wildcard
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Set comprehensive CORS headers
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin",
    "Content-Type": "application/json"
  };

  // Handle OPTIONS preflight requests
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request in cors-debug");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Create a response object with diagnostic information
  const response = {
    message: "CORS Diagnostic Information",
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
      queryParams: event.queryStringParameters || {},
      hasBody: !!event.body
    },
    environment: {
      node_version: process.version,
      env_vars: [
        "NODE_ENV",
        "NETLIFY",
        "REACT_APP_DOMAIN",
        "REACT_APP_API_URL",
        "PLAID_ENV"
      ].reduce((obj, key) => {
        obj[key] = process.env[key] || '(not set)';
        return obj;
      }, {})
    },
    cors: {
      headers_returned: headers
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response, null, 2)
  };
}; 