/**
 * Netlify Function to fetch user data by ID
 */
import admin from 'firebase-admin';
import { getUserByFirebaseUid } from './utils/user-sync';

// Initialize Firebase Admin if not already initialized
let _app;
try {
  _app = admin.initializeApp();
} catch (e) {
  // App already initialized
  _app = admin.app();
}

// Handler for user data fetch
export const handler = async (event, _context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Handle GET request only
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Extract user ID from path
    const userId = event.path.split('/').pop();
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }

    // Get user from database
    const user = await getUserByFirebaseUid(userId);
    
    if (!user) {
      // Return basic user structure if not found in database
      // This matches the fallback in AuthContext.tsx
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            theme: 'system',
            notifications: true,
            currency: 'USD'
          }
        })
      };
    }

    // Return user data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user)
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error fetching user data', error: error.message })
    };
  }
}; 