/**
 * Serverless function for exchanging Plaid public tokens for access tokens
 */

import { 
  getPlaidClient, 
  createSuccessResponse, 
  createErrorResponse 
} from './utils/plaid-client.js';
import corsHandler from './utils/cors-handler.js';
import authHandler from './utils/auth-handler.js';
import { createLogger } from './utils/logger.js';
import { encrypt } from './utils/encryption-utils.js';

const logger = createLogger('plaid-exchange-token');

export const handler = async function(event, context) {
  const origin = event.headers.origin || '*';
  const requestId = event.headers['x-request-id'] || `req_${Date.now()}`;

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return corsHandler.createPreflightResponse(origin);
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return createErrorResponse(405, { message: 'Method not allowed' });
    }

    // Get user from request
    const user = await authHandler.getUserFromRequest(event);
    
    // Check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId });
      return createErrorResponse(401, { 
        message: 'Authentication required for this endpoint',
        code: 'UNAUTHORIZED'
      });
    }

    // Parse request body
    const { public_token } = JSON.parse(event.body);
    if (!public_token) {
      return createErrorResponse(400, { 
        message: 'Missing public_token in request body',
        code: 'MISSING_PUBLIC_TOKEN'
      });
    }

    logger.info('Exchanging public token', {
      requestId,
      userId: user.uid
    });

    const plaidClient = getPlaidClient();
    
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get master encryption key
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      throw new Error('Missing encryption master key');
    }

    // Encrypt the access token before storing
    const encryptedAccessToken = encrypt(accessToken, masterKey);

    // TODO: Store encrypted access token and item ID in database
    // This should be implemented based on your database schema
    
    logger.info('Successfully exchanged public token', {
      requestId,
      userId: user.uid,
      itemId
    });

    return createSuccessResponse({
      itemId,
      message: 'Successfully linked account'
    }, requestId);
  } catch (error) {
    logger.error('Failed to exchange public token', {
      requestId,
      error: {
        message: error.message,
        type: error.constructor.name
      }
    });

    return createErrorResponse(500, error, requestId);
  }
}; 