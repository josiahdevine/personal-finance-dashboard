import { loadStripe } from '@stripe/stripe-js';

/**
 * Safely initializes Stripe with fallback for missing API keys
 * 
 * @returns {Promise<Stripe|null>} A Promise that resolves to the Stripe instance or null if unavailable
 */
export const initializeStripe = async () => {
  const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  
  // Check if we have a valid Stripe key
  if (!STRIPE_KEY || typeof STRIPE_KEY !== 'string' || !STRIPE_KEY.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key. Please check your environment variables.');
    return null;
  }
  
  try {
    const stripePromise = await loadStripe(STRIPE_KEY);
    if (!stripePromise) {
      console.error('Failed to initialize Stripe with the provided key.');
      return null;
    }
    console.log('[Stripe] Successfully initialized');
    return stripePromise;
  } catch (error) {
    console.error('[Stripe] Failed to initialize:', error);
    return null;
  }
};

/**
 * Checks if Stripe is available based on API key and environment
 * 
 * @returns {boolean} Whether Stripe should be available
 */
export const isStripeAvailable = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  return !!key && typeof key === 'string' && key.startsWith('pk_');
}; 