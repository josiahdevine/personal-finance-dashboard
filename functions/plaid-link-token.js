/**
 * Plaid Link Token API
 * Creates a link token for initializing Plaid Link
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createCorsResponse, handleOptionsRequest } from './utils/cors-handler.js';
import { verifyAuthToken } from './utils/auth-handler.js';

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENVIRONMENT || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

/**
 * Netlify serverless function handler for creating Plaid link tokens
 */
export const handler = async (event, context) => {
  // Log request details for debugging
  console.log('Plaid Link Token Request:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || event.headers.Origin
  });
  
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest(event);
  }
  
  // Get request origin for CORS
  const origin = event.headers.origin || event.headers.Origin;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return createCorsResponse(405, { error: 'Method not allowed' }, origin);
  }
  
  try {
    // Verify authentication
    const user = await verifyAuthToken(event);
    if (!user) {
      return createCorsResponse(401, { error: 'Unauthorized' }, origin);
    }
    
    // Log authenticated user
    console.log('Creating Plaid link token for user:', {
      userId: user.uid,
      email: user.email
    });
    
    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    }
    
    // Get redirect URI from request or use default
    const redirectUri = requestBody.redirectUri || process.env.PLAID_REDIRECT_URI;
    
    // Create link token request
    const tokenRequest = {
      user: {
        client_user_id: user.uid
      },
      client_name: 'Personal Finance Dashboard',
      products: ['transactions'],
      language: 'en',
      country_codes: ['US'],
    };
    
    // Add redirect URI if provided
    if (redirectUri) {
      tokenRequest.redirect_uri = redirectUri;
    }
    
    // Add Android package name if provided in environment
    if (process.env.PLAID_ANDROID_PACKAGE_NAME) {
      tokenRequest.android_package_name = process.env.PLAID_ANDROID_PACKAGE_NAME;
    }
    
    // Create the link token with Plaid
    const createTokenResponse = await plaidClient.linkTokenCreate(tokenRequest);
    
    // Return the link token
    return createCorsResponse(200, {
      linkToken: createTokenResponse.data.link_token,
      expiration: createTokenResponse.data.expiration
    }, origin);
  } catch (error) {
    // Log error details
    console.error('Error creating Plaid link token:', error);
    
    // Format Plaid API errors
    let errorMessage = error.message;
    let errorCode = 'INTERNAL_ERROR';
    
    if (error.response && error.response.data) {
      errorMessage = error.response.data.error_message || errorMessage;
      errorCode = error.response.data.error_code || errorCode;
    }
    
    // Return error response
    return createCorsResponse(500, {
      error: 'Failed to create link token',
      errorCode,
      message: errorMessage
    }, origin);
  }
}; 