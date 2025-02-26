// Health Check API Function
exports.handler = async function(event, context) {
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  try {
    // Create response with server status and details
    const response = {
      status: "healthy",
      message: "API is running correctly",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      platform: "Netlify Functions",
      version: "1.0.0"
    };

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