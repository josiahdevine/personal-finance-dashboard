// Plaid Status API Function
exports.handler = async function(event, context) {
  console.log("Received plaid-status request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*',
    query: event.queryStringParameters
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
    console.log("Handling OPTIONS preflight request for plaid-status");
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
    console.log("Processing GET request for plaid status");
    
    // Parse the authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Auth header present:", !!authHeader);
    
    // Here you would typically verify the user's token and check their Plaid connection status
    // For now, we'll return a mock status
    
    const mockStatus = {
      connected: true,
      items: [
        {
          id: 'mock-item-1',
          institution_name: 'Mock Bank',
          institution_id: 'ins_mock',
          status: 'good',
          last_updated: new Date().toISOString(),
          accounts_connected: 2
        },
        {
          id: 'mock-item-2',
          institution_name: 'Mock Credit Union',
          institution_id: 'ins_mock2',
          status: 'good',
          last_updated: new Date().toISOString(),
          accounts_connected: 1
        }
      ],
      total_accounts: 3,
      last_sync: new Date().toISOString(),
      can_add_accounts: true
    };

    console.log("Returning mock plaid status");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockStatus)
    };
  } catch (error) {
    console.error("Error checking Plaid status:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to check Plaid status",
        message: error.message
      })
    };
  }
}; 