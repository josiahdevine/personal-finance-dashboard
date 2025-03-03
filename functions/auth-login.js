import admin from 'firebase-admin';
import corsHandler from './utils/cors-handler.js';
import { createLogger } from './utils/logger.js';
import serviceAccount from './firebase-config.json' assert { type: 'json' };

const logger = createLogger('auth-login');

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
    const { email, password } = JSON.parse(event.body);
    
    if (!email || !password) {
      return corsHandler.createCorsResponse(400, {
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      }, origin);
    }
    
    // Initialize Firebase if needed
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    // Sign in with email and password
    const auth = admin.auth();
    const userRecord = await auth.getUserByEmail(email);
    
    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);
    
    // Return success response
    return corsHandler.createCorsResponse(200, {
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    }, origin);
  } catch (error) {
    logger.error('Login error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return corsHandler.createCorsResponse(401, {
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, origin);
    }
    
    return corsHandler.createCorsResponse(500, {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, origin);
  }
}; 