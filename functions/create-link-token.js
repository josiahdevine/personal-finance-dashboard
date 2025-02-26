// Plaid Link Token Creation Function
// This is a stub implementation - you'll need to add your actual Plaid API credentials
exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
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

    // In a real implementation, you would initialize the Plaid client here
    // const plaidClient = new plaid.Client({
    //   clientID: process.env.PLAID_CLIENT_ID,
    //   secret: process.env.PLAID_SECRET,
    //   env: plaid.environments[process.env.PLAID_ENV || 'sandbox']
    // });

    // Mock response - replace with actual Plaid API call in production
    const mockLinkToken = `link-sandbox-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
    
    // For demo/development purposes, we're returning a mock token
    // In production, you would call plaidClient.createLinkToken() here
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        link_token: mockLinkToken,
        expiration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        request_id: `req-${Date.now()}`
      })
    };
    
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to create link token",
        message: error.message
      })
    };
  }
}; 