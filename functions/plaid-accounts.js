// Plaid Accounts API Function
exports.handler = async function(event, context) {
  // CORS headers for cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Here you would normally query Plaid for the user's accounts
    // For now, we'll return mock data
    
    // Mock response with account data
    const mockAccounts = {
      items: [
        {
          id: 'mock-item-1',
          institution_name: 'Mock Bank',
          institution_id: 'ins_mock',
          accounts: [
            {
              account_id: 'mock-account-1',
              name: 'Mock Checking',
              official_name: 'CHECKING ACCOUNT',
              type: 'depository',
              subtype: 'checking',
              mask: '1234',
              current_balance: 5432.10,
              available_balance: 5400.00
            },
            {
              account_id: 'mock-account-2',
              name: 'Mock Savings',
              official_name: 'SAVINGS ACCOUNT',
              type: 'depository',
              subtype: 'savings',
              mask: '5678',
              current_balance: 12345.67,
              available_balance: 12345.67
            }
          ]
        },
        {
          id: 'mock-item-2',
          institution_name: 'Mock Credit Union',
          institution_id: 'ins_mock2',
          accounts: [
            {
              account_id: 'mock-account-3',
              name: 'Mock Credit Card',
              official_name: 'PLATINUM CREDIT CARD',
              type: 'credit',
              subtype: 'credit card',
              mask: '9012',
              current_balance: -2540.15,
              available_balance: 7459.85,
              limit: 10000
            }
          ]
        }
      ],
      balances: [
        {
          account_id: 'mock-account-1',
          account_name: 'Mock Checking',
          account_type: 'checking',
          current_balance: 5432.10,
          institution_name: 'Mock Bank'
        },
        {
          account_id: 'mock-account-2',
          account_name: 'Mock Savings',
          account_type: 'savings',
          current_balance: 12345.67,
          institution_name: 'Mock Bank'
        },
        {
          account_id: 'mock-account-3',
          account_name: 'Mock Credit Card',
          account_type: 'credit card',
          current_balance: -2540.15,
          institution_name: 'Mock Credit Union'
        }
      ]
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockAccounts)
    };
  } catch (error) {
    console.error("Error fetching Plaid accounts:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch accounts",
        message: error.message
      })
    };
  }
}; 