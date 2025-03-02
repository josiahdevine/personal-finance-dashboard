/**
 * Authentication Handler for Netlify Functions
 * Provides utilities for verifying Firebase authentication tokens
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
let firebaseApp;
function initializeFirebaseAdmin() {
  if (!firebaseApp && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Parse the service account JSON
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
      );
      
      // Initialize the app
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw new Error('Firebase initialization failed');
    }
  }
  
  return firebaseApp;
}

/**
 * Extract the JWT token from the Authorization header
 * @param {object} event - Netlify function event
 * @returns {string|null} The JWT token or null if not found
 */
function extractToken(event) {
  // Check for Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader) {
    console.log('No Authorization header found');
    return null;
  }
  
  // Extract the token from the Bearer format
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  if (!match) {
    console.log('Invalid Authorization header format');
    return null;
  }
  
  return match[1];
}

/**
 * Verify a Firebase authentication token
 * @param {object} event - Netlify function event
 * @returns {Promise<object|null>} The decoded user object or null if invalid
 */
async function verifyAuthToken(event) {
  try {
    // Extract token from request
    const token = extractToken(event);
    if (!token) {
      return null;
    }
    
    // Initialize Firebase if needed
    initializeFirebaseAdmin();
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Log successful verification
    console.log('Token verified successfully:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    });
    
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if a user has the required role
 * @param {object} user - The decoded user object
 * @param {string|string[]} requiredRoles - The required role(s)
 * @returns {boolean} Whether the user has the required role
 */
function hasRole(user, requiredRoles) {
  if (!user || !user.roles) {
    return false;
  }
  
  // Convert to array if string
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Check if user has any of the required roles
  return roles.some(role => user.roles.includes(role));
}

/**
 * Extract user info from request
 * @param {object} event - Netlify function event
 * @returns {Promise<object>} - User info object with uid and isAuthenticated
 */
async function getUserFromRequest(event) {
  const user = await verifyAuthToken(event);
  
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
 * Create standard CORS headers for auth responses
 * @param {string} origin - Request origin
 * @returns {object} - CORS headers
 */
function getAuthCorsHeaders(origin) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Environment, X-Request-ID',
    'Access-Control-Allow-Credentials': 'true'
  };
}

/**
 * Create a standard auth error response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {string} origin - Request origin
 * @returns {object} - Formatted response
 */
function createAuthErrorResponse(statusCode, body, origin) {
  return {
    statusCode,
    headers: getAuthCorsHeaders(origin),
    body: JSON.stringify(body)
  };
}

/**
 * Middleware to require authentication
 * @param {function} handler - The handler function to wrap
 * @returns {function} - Wrapped handler function with authentication check
 */
function requireAuth(handler) {
  return async (event, context) => {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: getAuthCorsHeaders(origin),
        body: ""
      };
    }
    
    // Verify user authentication
    const user = await verifyAuthToken(event);
    
    // If user is not authenticated
    if (!user) {
      return createAuthErrorResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint"
      }, origin);
    }
    
    // Add user to event object
    event.user = user;
    
    // Call the original handler with the authenticated user
    return handler(event, context);
  };
}

// Create a default export object with all the functions
const authHandler = {
  verifyAuthToken,
  hasRole,
  extractToken,
  getUserFromRequest,
  requireAuth,
  getAuthCorsHeaders,
  createAuthErrorResponse
};

export default authHandler; 