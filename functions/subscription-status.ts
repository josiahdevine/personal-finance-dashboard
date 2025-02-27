import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { auth } from './lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Verify Firebase auth
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get customer
    const customerSnapshot = await stripe.customers.search({
      query: `metadata['firebaseUID']:'${userId}'`,
    });

    if (customerSnapshot.data.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'no_subscription' }),
      };
    }

    const customer = customerSnapshot.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'no_subscription' }),
      };
    }

    const subscription = subscriptions.data[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'active',
        subscription: {
          id: subscription.id,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          plan: {
            id: subscription.items.data[0].price.id,
            name: subscription.items.data[0].price.nickname,
            amount: subscription.items.data[0].price.unit_amount,
            currency: subscription.items.data[0].price.currency,
            interval: subscription.items.data[0].price.recurring?.interval,
          },
        },
      }),
    };
  } catch (error) {
    console.error('Subscription status error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 