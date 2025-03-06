import { Handler } from '@netlify/functions';
import { db } from '../config/firebase-admin';
import { auth } from '../config/firebase-admin';

export const handler: Handler = async (event, context) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      },
    };
  }

  // Verify authentication
  const authHeader = event.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET': {
        const portfolioRef = db.collection('portfolios').doc(userId);
        const portfolioDoc = await portfolioRef.get();

        if (!portfolioDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Portfolio not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(portfolioDoc.data()),
        };
      }

      case 'POST': {
        const data = JSON.parse(event.body || '{}');
        const portfolioRef = db.collection('portfolios').doc(userId);
        await portfolioRef.set({
          ...data,
          userId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 