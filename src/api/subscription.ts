import { Handler } from '@netlify/functions';
import { db, auth } from '../config/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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

    // Get user's Stripe customer ID
    const userDoc = await db.collection('users').doc(userId).get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No Stripe customer found' }),
      };
    }

    // Handle different endpoints
    const path = event.path.split('/').pop();

    switch (path) {
      case 'status': {
        // Get subscription status
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 1,
          status: 'active',
        });

        const subscription = subscriptions.data[0];
        if (!subscription) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              status: 'none',
              plan: null,
              currentPeriodEnd: null,
            }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            status: subscription.status,
            plan: subscription.items.data[0].price.nickname,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          }),
        };
      }

      case 'portal': {
        // Create customer portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${process.env.APP_URL}/settings`,
        });

        return {
          statusCode: 200,
          body: JSON.stringify({ url: session.url }),
        };
      }

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Endpoint not found' }),
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