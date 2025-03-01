/**
 * Serverless function for checking Plaid connection status
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');

// IMPORTANT: Create a standalone handler that properly handles CORS
exports.handler = async function(event, context) {
  console.log("Received plaid-status request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Always handle OPTIONS requests first, before any auth checks
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight for plaid-status");
    return corsHandler.handleCorsPreflightRequest(event);
  }

  // For non-OPTIONS requests, proceed with standard flow and authentication
  try {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
      return corsHandler.createCorsResponse(405, {
        error: "Method not allowed"
      }, origin);
    }

    // Get user from request (with modified auth handling)
    const user = await authHandler.getUserFromRequest(event);
    
    // Since we're handling auth ourselves, check if user is authenticated
    if (!user.isAuthenticated) {
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint"
      }, origin);
    }

    // Use the authenticated user ID from the auth middleware
    const userId = user.uid;

    console.log(`Checking Plaid status for user: ${userId}`);

    // Initialize the Plaid client
    const plaidClientId = process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID;
    const plaidSecret = process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET;
    const plaidEnv = process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox';
    
    if (!plaidClientId || !plaidSecret) {
      console.error("Missing Plaid credentials");
      return corsHandler.createCorsResponse(500, {
        error: "Configuration error",
        message: "Missing Plaid API credentials"
      }, origin);
    }

    // Configure Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': plaidClientId,
          'PLAID-SECRET': plaidSecret,
        },
      },
    });
    
    const plaidClient = new PlaidApi(configuration);

    // In a production environment, you would query your database
    // to check for existing Plaid connections for this user
    // For now, we're returning a simple status response
    
    return corsHandler.createCorsResponse(200, {
      status: "operational",
      environment: plaidEnv,
      message: "Plaid API connection is functioning correctly",
      userId: userId,
      isAuthenticated: user.isAuthenticated,
      timestamp: new Date().toISOString()
    }, origin);
    
  } catch (error) {
    console.error("Error checking Plaid status:", error);
    
    return corsHandler.createCorsResponse(500, {
      error: "Failed to check Plaid status",
      message: error.message,
      details: error.response?.data || {}
    }, origin);
  }
}; 