import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { auth } from '../services/firebase';

// Initialize Stripe
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

class StripeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://api.trypersonalfinance.com';
  }

  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }
    return user.getIdToken();
  }

  async createCheckoutSession(priceId: string) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.post(
        `${this.baseUrl}/api/create-checkout-session`,
        { priceId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  async createCustomerPortalSession() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.post(
        `${this.baseUrl}/api/create-portal-session`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  async getSubscriptionStatus() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/api/subscription-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  async getProducts() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }
}

export const stripeService = new StripeService();
export default StripeService; 