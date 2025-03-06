import { Handler } from '@netlify/functions';
import { db, auth } from '../config/firebase-admin';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../types/models';

export const handler: Handler = async (event, _context) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
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
        const categoriesSnapshot = await db.collection('categories')
          .where('userId', '==', userId)
          .get();

        const categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          statusCode: 200,
          body: JSON.stringify(categories),
        };
      }

      case 'POST': {
        const data = JSON.parse(event.body || '{}') as CreateCategoryData;
        const categoryRef = await db.collection('categories').add({
          ...data,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const categoryDoc = await categoryRef.get();
        const category = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
        };

        return {
          statusCode: 201,
          body: JSON.stringify(category),
        };
      }

      case 'PATCH': {
        const categoryId = event.path.split('/').pop();
        if (!categoryId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Category ID is required' }),
          };
        }

        const data = JSON.parse(event.body || '{}') as UpdateCategoryData;
        const categoryRef = db.collection('categories').doc(categoryId);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Category not found' }),
          };
        }

        if (categoryDoc.data()?.userId !== userId) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden' }),
          };
        }

        await categoryRef.update({
          ...data,
          updatedAt: new Date().toISOString(),
        });

        const updatedDoc = await categoryRef.get();
        const category = {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        };

        return {
          statusCode: 200,
          body: JSON.stringify(category),
        };
      }

      case 'DELETE': {
        const categoryId = event.path.split('/').pop();
        if (!categoryId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Category ID is required' }),
          };
        }

        const categoryRef = db.collection('categories').doc(categoryId);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Category not found' }),
          };
        }

        if (categoryDoc.data()?.userId !== userId) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden' }),
          };
        }

        await categoryRef.delete();

        return {
          statusCode: 204,
          body: '',
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