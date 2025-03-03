import admin from 'firebase-admin';
import corsHandler from './utils/cors-handler.js';
import { createLogger } from './utils/logger.js';
import serviceAccount from './firebase-config.json' assert { type: 'json' };

const logger = createLogger('auth-logout');

export const handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin || '*';
  
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
    // Parse request body
    const { uid } = JSON.parse(event.body);
    
    if (!uid) {
      return corsHandler.createCorsResponse(400, {
        error: 'User ID is required',
        code: 'MISSING_UID'
      }, origin);
    }
    
    // Initialize Firebase if needed
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(uid);
    
    // Return success response
    return corsHandler.createCorsResponse(200, {
      message: 'Successfully logged out',
      code: 'LOGOUT_SUCCESS'
    }, origin);
  } catch (error) {
    logger.error('Logout error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return corsHandler.createCorsResponse(404, {
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, origin);
    }
    
    return corsHandler.createCorsResponse(500, {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, origin);
  }
}; 