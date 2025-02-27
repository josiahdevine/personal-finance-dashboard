/**
 * Health check endpoint for the Personal Finance Dashboard API
 * This function checks the overall health of the system, including:
 * - API connectivity
 * - Database connectivity
 * - Environment variables
 */

const corsHandler = require('./utils/cors-handler');
const dbConnector = require('./utils/db-connector');

exports.handler = async function(event, context) {
  console.log("Received health-check request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Handle CORS preflight
  const preflightResponse = corsHandler.handleCorsPreflightRequest(event);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed"
    }, origin);
  }

  try {
    // Check database connectivity
    let dbStatus = { status: "unknown" };
    try {
      dbStatus = await dbConnector.checkDbStatus();
    } catch (dbError) {
      console.error("Database check failed:", dbError);
      dbStatus = {
        status: "error",
        error: dbError.message
      };
    }

    // Check environment variables
    const envStatus = {
      node_env: process.env.NODE_ENV || "not set",
      has_firebase_config: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
      has_plaid_config: !!(process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID),
      has_db_config: !!process.env.DATABASE_URL
    };

    // Prepare response
    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      api: {
        status: "operational",
        region: process.env.AWS_REGION || "unknown"
      },
      database: dbStatus,
      environment: envStatus
    };

    // If database is not connected, mark overall status as degraded
    if (dbStatus.connected === false) {
      response.status = "degraded";
    }

    return corsHandler.createCorsResponse(200, response, origin);
  } catch (error) {
    console.error("Health check error:", error);
    
    return corsHandler.createCorsResponse(500, {
      status: "error",
      error: "Failed to check system health",
      message: error.message
    }, origin);
  }
}; 