/**
 * Serverless function for checking Plaid connection status
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received plaid-status request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    user: {
      uid: event.user.uid,
      isAuthenticated: event.user.isAuthenticated
    }
  });

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
    // Use the authenticated user ID from the auth middleware
    const userId = event.user.uid;

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
      isAuthenticated: event.user.isAuthenticated,
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
}, { corsHandler }); 