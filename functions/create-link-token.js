/**
 * Serverless function for creating Plaid link tokens
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

exports.handler = async function(event, context) {
  console.log("Received create-link-token request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
  });

  // Get the requesting origin or default to *
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request for create-link-token");
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body || '{}');
    const userId = data.userId || 'unknown-user';

    console.log(`Generating Plaid link token for user: ${userId}`);

    // Initialize the Plaid client
    const plaidClientId = process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID;
    const plaidSecret = process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET;
    const plaidEnv = process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox';
    
    if (!plaidClientId || !plaidSecret) {
      console.error("Missing Plaid credentials");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Configuration error",
          message: "Missing Plaid API credentials"
        })
      };
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
      country_codes: ['US', 'CA'],
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(linkToken)
    };
    
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to create link token",
        message: error.message,
        details: error.response?.data || {}
      })
    };
  }
}; 