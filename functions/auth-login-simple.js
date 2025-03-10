/**
 * Simple authentication endpoint that always returns success
 * This is a fallback for local development when the backend service may not be available
 */

exports.handler = async function(event, _context) {
  console.log("Received auth-login-simple request:", {
    httpMethod: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin || '*'
  });

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Check if it's a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Method not allowed'
      })
    };
  }

  // Parse the request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    body = {};
  }

  // Return a successful login response
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: 'Authentication successful',
      token: 'mock-auth-token-for-development',
      user: {
        id: body.uid || 'mock-user-id',
        email: body.email || 'user@example.com',
        displayName: body.displayName || 'Development User',
        isAuthenticated: true
      },
      timestamp: new Date().toISOString()
    })
  };
}; 