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
    
    return null;
  }
  
  try {
    const stripePromise = await loadStripe(STRIPE_KEY);
    if (!stripePromise) {
      
      return null;
    }
    
    return stripePromise;
  } catch (error) {
    
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