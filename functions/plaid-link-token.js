/**
 * Serverless function for creating Plaid link tokens
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  console.log("Received plaid-link-token request:", {
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

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed"
    }, origin);
  }

  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body || '{}');
    
    // Use the authenticated user ID from the auth middleware
    const userId = event.user.uid;

    console.log(`Generating Plaid link token for user: ${userId}`);

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

    // Prepare the request for creating a link token
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Personal Finance Dashboard',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US'], // US-only application as specified in requirements
      webhook: `https://api.trypersonalfinance.com/api/plaid/webhook`,
    };

    // Add redirect URI if available
    const redirectUri = process.env.PLAID_REDIRECT_URI || process.env.REACT_APP_PLAID_REDIRECT_URI;
    if (redirectUri) {
      request.redirect_uri = redirectUri;
    }

    console.log("Creating Plaid link token with request:", JSON.stringify(request, null, 2));
    
    // Create the link token with Plaid API
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    const linkToken = createTokenResponse.data;
    
    console.log("Successfully created link token");
    
    return corsHandler.createCorsResponse(200, linkToken, origin);
    
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
    
    return corsHandler.createCorsResponse(500, {
      error: "Failed to create link token",
      message: error.message,
      details: error.response?.data || {}
    }, origin);
  }
}, { corsHandler }); 