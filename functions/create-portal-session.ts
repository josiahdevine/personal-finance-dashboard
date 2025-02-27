import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { auth } from './lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
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
        statusCode: 404,
        body: JSON.stringify({ error: 'Customer not found' }),
      };
    }

    const customer = customerSnapshot.data[0];

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.URL}/dashboard`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe portal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 