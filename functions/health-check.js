// Health Check API Function
exports.handler = async function(event, context) {
  console.log("Received health-check request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  try {
    console.log("Processing health check request");
    // Create response with server status and details
    const response = {
      status: "healthy",
      message: "API is running correctly",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      platform: "Netlify Functions",
      version: "1.0.0"
    };

    console.log("Returning health check response");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error("Health check error:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Internal server error",
        error: error.message
      })
    };
  }
}; 