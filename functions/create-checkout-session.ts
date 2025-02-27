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

    // Get or create customer
    const customerSnapshot = await stripe.customers.search({
      query: `metadata['firebaseUID']:'${userId}'`,
    });

    let customer;
    if (customerSnapshot.data.length === 0) {
      customer = await stripe.customers.create({
        metadata: {
          firebaseUID: userId,
        },
      });
    } else {
      customer = customerSnapshot.data[0];
    }

    // Parse request body
    const { priceId } = JSON.parse(event.body || '{}');
    if (!priceId) {
      return { statusCode: 400, body: 'Price ID is required' };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        firebaseUID: userId,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 