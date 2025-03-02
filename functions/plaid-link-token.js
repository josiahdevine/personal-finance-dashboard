/**
 * Plaid Link Token API
 * Creates a link token for initializing Plaid Link
 */

const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');
const { getPlaidClient } = require('./utils/plaid-client');
const { logInfo, logError } = require('./utils/logger');

exports.handler = async function(event, context) {
  // Get the requesting origin
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Handle preflight requests
  const preflightResponse = corsHandler.handleCorsPreflightRequest(event);
  if (preflightResponse) return preflightResponse;

  // Log the request
  logInfo('plaid-link-token', 'Received request', {
    path: event.path,
    method: event.httpMethod,
    origin: origin,
    headers: Object.keys(event.headers)
  });

  try {
    // Verify authentication
    const user = await authHandler.verifyUser(event);
    if (!user) {
      return corsHandler.createCorsResponse(401, {
        error: 'Unauthorized',
        message: 'Authentication required'
      }, origin);
    }

    // Get Plaid client
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      logError('plaid-link-token', 'Plaid client initialization failed');
      return corsHandler.createCorsResponse(500, {
        error: 'Plaid Configuration Error',
        message: 'Failed to initialize Plaid client'
      }, origin);
    }

    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        logError('plaid-link-token', 'Failed to parse request body', e);
      }
    }

    // Create link token request
    const linkTokenRequest = {
      user: {
        client_user_id: user.uid || 'anonymous-user',
      },
      client_name: 'Personal Finance Dashboard',
      products: ['transactions', 'auth'],
      country_codes: ['US'],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
      ...requestBody
    };

    // Log the link token request (without sensitive data)
    logInfo('plaid-link-token', 'Creating link token', {
      clientUserId: linkTokenRequest.user.client_user_id,
      products: linkTokenRequest.products,
      countryCodes: linkTokenRequest.country_codes
    });

    // Create the link token
    const createTokenResponse = await plaidClient.linkTokenCreate(linkTokenRequest);
    const linkToken = createTokenResponse.data.link_token;

    // Return the link token
    return corsHandler.createCorsResponse(200, {
      link_token: linkToken,
      expiration: createTokenResponse.data.expiration
    }, origin);
  } catch (error) {
    // Log the error
    logError('plaid-link-token', 'Error creating link token', {
      error: error.message,
      stack: error.stack,
      plaidError: error.response?.data
    });

    // Determine the appropriate status code
    let statusCode = 500;
    let errorMessage = 'An error occurred while creating the link token';
    
    if (error.response) {
      // Handle Plaid API errors
      statusCode = error.response.status;
      errorMessage = error.response.data.error_message || errorMessage;
    }

    // Return the error response
    return corsHandler.createCorsResponse(statusCode, {
      error: 'Plaid API Error',
      message: errorMessage,
      requestId: context.awsRequestId
    }, origin);
  }
}; 