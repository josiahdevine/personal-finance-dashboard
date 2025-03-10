import { api } from '../utils/api';

export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'none';
  plan: string;
  currentPeriodEnd: string;
}

export class SubscriptionService {
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const response = await api.get<SubscriptionStatus>(`/subscription/${userId}/status`);
    return response.data;
  }

  static async getSubscription(userId: string): Promise<SubscriptionStatus> {
    const response = await api.get<SubscriptionStatus>(`/subscription/${userId}`);
    return response.data;
  }

  static async createCustomerPortalSession(userId: string): Promise<string> {
    const response = await api.post<{ url: string }>(`/subscription/${userId}/portal`);
    return response.data.url;
  }
} 