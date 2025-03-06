exports.handler = async (event, context) => {
  // Add CORS headers to all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Get user ID from path parameter
  const path = event.path;
  const userId = path.split('/').pop();

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Mock response for testing
    const accounts = [
      { 
        id: 1, 
        userId: userId,
        name: 'Checking Account',
        type: 'CHECKING',
        balance: 5000.00,
        currency: 'USD'
      },
      {
        id: 2,
        userId: userId,
        name: 'Savings Account',
        type: 'SAVINGS',
        balance: 10000.00,
        currency: 'USD'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(accounts)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message 
      })
    };
  }
}; 