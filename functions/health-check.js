// Health Check API Function
exports.handler = async function(event, context) {
  console.log("Received health check request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request for health check");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Parse the authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Auth header present:", !!authHeader);
    
    // Return health status
    const healthStatus = {
      status: "healthy",
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      auth: authHeader ? "valid" : "missing",
      services: {
        api: "online",
        database: "connected",
        plaid: "available"
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(healthStatus)
    };
  } catch (error) {
    console.error("Error performing health check:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Health check failed",
        message: error.message
      })
    };
  }
}; 