/**
 * Stripe service for payment processing
 * This file handles all interactions with the Stripe API
 */
import { loadStripe } from '@stripe/stripe-js';
import api from './api';

// Initialize Stripe with the publishable key
let stripePromise;

/**
 * Get the Stripe instance (loads it if not already loaded)
 * @returns {Promise<Stripe>} Stripe instance
 */
export const getStripe = async () => {
  if (!stripePromise) {
    // Use environment variable for the Stripe key
    const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    
    if (!stripeKey) {
      console.error('Stripe publishable key is missing. Please check your environment variables.');
      throw new Error('Stripe configuration error');
    }
    
    stripePromise = loadStripe(stripeKey);
  }
  
  return stripePromise;
};

/**
 * Create a payment intent
 * @param {Object} paymentData Payment data
 * @returns {Promise<Object>} Payment intent details
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-payment-intent', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(error.response?.data?.message || 'Failed to create payment intent');
  }
};

/**
 * Create a subscription
 * @param {Object} subscriptionData Subscription data
 * @returns {Promise<Object>} Subscription details
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const response = await api.post('/payments/create-subscription', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error(error.response?.data?.message || 'Failed to create subscription');
  }
};

/**
 * Get customer payment methods
 * @returns {Promise<Array>} List of payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payments/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
  }
};

/**
 * Add a new payment method
 * @param {string} paymentMethodId Stripe payment method ID
 * @returns {Promise<Object>} Added payment method details
 */
export const addPaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.post('/payments/add-payment-method', { paymentMethodId });
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw new Error(error.response?.data?.message || 'Failed to add payment method');
  }
};

/**
 * Remove a payment method
 * @param {string} paymentMethodId Stripe payment method ID
 * @returns {Promise<{success: boolean}>} Removal status
 */
export const removePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.delete('/payments/payment-methods/' + paymentMethodId);
    return response.data;
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove payment method');
  }
};

/**
 * Get subscription details
 * @returns {Promise<Object>} Current subscription details
 */
export const getSubscriptionDetails = async () => {
  try {
    const response = await api.get('/payments/subscription');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch subscription details');
  }
};

/**
 * Cancel subscription
 * @returns {Promise<{success: boolean}>} Cancellation status
 */
export const cancelSubscription = async () => {
  try {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
}; 