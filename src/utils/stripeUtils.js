import { loadStripe } from '@stripe/stripe-js';

/**
 * Safely initializes Stripe with fallback for missing API keys
 * 
 * @returns {Promise<Stripe|null>} A Promise that resolves to the Stripe instance or null if unavailable
 */
export const initializeStripe = () => {
  const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  
  // Check if we have a Stripe key
  if (!STRIPE_KEY) {
    console.error('Stripe publishable key is missing. Please check your environment variables.');
    return Promise.resolve(null);
  }
  
  // Initialize Stripe with the available key
  try {
    const stripePromise = loadStripe(STRIPE_KEY);
    if (!stripePromise) {
      console.error('Failed to initialize Stripe with the provided key.');
      return Promise.resolve(null);
    }
    return stripePromise;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return Promise.resolve(null);
  }
};

/**
 * Checks if Stripe is available based on API key and environment
 * 
 * @returns {boolean} Whether Stripe should be available
 */
export const isStripeAvailable = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  return !!key && key.startsWith('pk_');
}; 