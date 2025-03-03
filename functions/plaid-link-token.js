/**
 * Plaid Link Token API
 * Creates a link token for initializing Plaid Link
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import corsHandler from './utils/cors-handler.js';
import authHandler from './utils/auth-handler.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('plaid-link-token');

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Content-Type': 'application/json',
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

/**
 * Netlify serverless function handler for creating Plaid link tokens
 */
export const handler = async (event, context) => {
  // Get request origin and request ID
  const origin = event.headers.origin || event.headers.Origin || '*';
  const requestId = event.headers['x-request-id'] || `req_${Date.now()}`;
  
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return corsHandler.handleOptionsRequest(event);
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return corsHandler.createCorsResponse(405, { 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    }, origin);
  }
  
  try {
    // Verify authentication
    const user = await authHandler.verifyAuthToken(event);
    if (!user) {
      logger.warn('Unauthorized request', { requestId });
      return corsHandler.createCorsResponse(401, { 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, origin);
    }
    
    // Log authenticated user
    logger.info('Creating Plaid link token', {
      requestId,
      userId: user.uid,
      email: user.email
    });
    
    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        logger.error('Error parsing request body', {
          requestId,
          error: e.message
        });
      }
    }
    
    // Get redirect URI from request or environment
    const redirectUri = requestBody.redirectUri || process.env.PLAID_REDIRECT_URI;
    
    // Create link token request
    const tokenRequest = {
      user: {
        client_user_id: user.uid
      },
      client_name: 'Personal Finance Dashboard',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    };
    
    // Add redirect URI if provided
    if (redirectUri) {
      tokenRequest.redirect_uri = redirectUri;
    }
    
    // Add Android package name if provided
    if (process.env.PLAID_ANDROID_PACKAGE_NAME) {
      tokenRequest.android_package_name = process.env.PLAID_ANDROID_PACKAGE_NAME;
    }
    
    // Create the link token with Plaid
    const createTokenResponse = await plaidClient.linkTokenCreate(tokenRequest);
    
    logger.info('Link token created successfully', {
      requestId,
      userId: user.uid,
      hasLinkToken: !!createTokenResponse.data.link_token
    });
    
    // Return the link token
    return corsHandler.createCorsResponse(200, {
      link_token: createTokenResponse.data.link_token,
      expiration: createTokenResponse.data.expiration
    }, origin);
  } catch (error) {
    // Log error details
    logger.error('Error creating link token', {
      requestId,
      error: {
        message: error.message,
        type: error.constructor.name,
        response: error.response?.data
      }
    });
    
    // Format Plaid API errors
    let errorMessage = error.message;
    let errorCode = 'INTERNAL_ERROR';
    
    if (error.response?.data) {
      errorMessage = error.response.data.error_message || errorMessage;
      errorCode = error.response.data.error_code || errorCode;
    }
    
    // Return error response
    return corsHandler.createCorsResponse(500, {
      error: 'Failed to create link token',
      code: errorCode,
      message: errorMessage
    }, origin);
  }
}; 