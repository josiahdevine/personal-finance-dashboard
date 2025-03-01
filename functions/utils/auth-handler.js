/**
 * Authentication Handler Utility for Firebase Auth
 * This module provides standardized auth handling for Netlify Functions
 */

const admin = require('firebase-admin');
// Import the CORS handler utility
const corsHandler = require('./cors-handler');

// Initialize Firebase Admin SDK if not already initialized
let firebaseApp;
function getFirebaseAdmin() {
  if (!firebaseApp) {
    // Check for required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || 
                      process.env.REACT_APP_FIREBASE_PROJECT_ID;
                      
    if (!projectId) {
      console.error('Firebase configuration missing! Auth verification will not work.');
      return null;
    }

    try {
      // Initialize the app with credentials from environment
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      if (error.code === 'app/duplicate-app') {
        // App already exists, get the existing one
        firebaseApp = admin.app();
        console.log('Using existing Firebase Admin app instance');
      } else {
        console.error('Firebase Admin SDK initialization error:', error);
        return null;
      }
    }
  }
  
  return firebaseApp;
}

/**
 * Verify Firebase authentication token
 * @param {string} authHeader - The full Authorization header value
 * @returns {Promise<object|null>} - User object if verified, null if invalid
 */
async function verifyAuthToken(authHeader) {
  // Check if auth header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid Authorization header found');
    return null;
  }

  const firebase = getFirebaseAdmin();
  if (!firebase) {
    console.error('Firebase Admin not initialized, cannot verify token');
    return null;
  }

  // Extract the token
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    console.log('Auth token verified successfully for user:', {
      uid: decodedToken.uid,
      email: decodedToken.email || 'no email',
      authTime: new Date(decodedToken.auth_time * 1000).toISOString()
    });
    
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error.message);
    return null;
  }
}

/**
 * Extract user info from request
 * @param {object} event - Netlify function event
 * @returns {Promise<object>} - User info object with uid and isAuthenticated
 */
async function getUserFromRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await verifyAuthToken(authHeader);
  
  // If we have a valid user from auth token
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      isAuthenticated: true,
      authTime: user.auth_time
    };
  }
  
  // Check query parameters for a userId as fallback
  // This is less secure but can be used for development/testing
  const queryUserId = event.queryStringParameters?.userId;
  if (queryUserId) {
    console.log('Using query parameter userId for request', {
      userId: queryUserId,
      path: event.path
    });
    
    return {
      uid: queryUserId,
      isAuthenticated: false,
      isDevMode: true
    };
  }
  
  // No user identified
  return {
    uid: 'anonymous',
    isAuthenticated: false
  };
}

/**
 * Authentication middleware for Netlify functions
 * Use this to protect routes that require authentication
 * 
 * @param {Function} handler - The function handler to protect
 * @param {object} options - Options for auth middleware
 * @returns {Function} - Wrapped handler with auth checking
 */
function requireAuth(handler, options = {}) {
  return async (event, context) => {
    const origin = event.headers.origin || event.headers.Origin || '*';
    
    // CRITICAL FIX: Handle OPTIONS request for CORS preflight directly
    // Always bypass all middleware and authentication for OPTIONS
    if (event.httpMethod === "OPTIONS") {
      console.log('Auth middleware bypassed for OPTIONS request', {
        path: event.path,
        origin
      });
      
      // Return immediate 204 No Content response with CORS headers
      return {
        statusCode: 204,
        headers: corsHandler.getCorsHeaders(origin),
        body: ""
      };
    }
    
    // Verify user authentication
    const user = await getUserFromRequest(event);
    
    // If authentication is required and user is not authenticated
    if (options.requireAuth !== false && !user.isAuthenticated) {
      console.log('Authentication failed for protected route', {
        path: event.path,
        method: event.httpMethod,
        origin
      });
      
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint"
      }, origin);
    }
    
    // Authentication successful, add user to event context
    const modifiedEvent = {
      ...event,
      user
    };
    
    // Continue to the handler - let the original handler use our response
    try {
      const response = await handler(modifiedEvent, context);
      
      // If the handler didn't set headers, add CORS headers
      if (!response.headers || !response.headers['Access-Control-Allow-Origin']) {
        response.headers = {
          ...response.headers,
          ...corsHandler.getCorsHeaders(origin)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in protected route handler:', error);
      return corsHandler.createCorsResponse(500, {
        error: "Internal Server Error",
        message: "An error occurred processing your request"
      }, origin);
    }
  };
}

module.exports = {
  getFirebaseAdmin,
  verifyAuthToken,
  getUserFromRequest,
  requireAuth
}; 