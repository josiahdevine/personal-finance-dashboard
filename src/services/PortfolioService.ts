import { api } from '../utils/api';
import type { Portfolio } from '../types/models';

export class PortfolioService {
  static async getPortfolio(userId: string): Promise<Portfolio> {
    const response = await api.get<Portfolio>(`/portfolio/${userId}`);
    return response.data;
  }

  static async updatePortfolio(userId: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const response = await api.patch<Portfolio>(`/portfolio/${userId}`, updates);
    return response.data;
  }

  static async refreshPortfolio(_userId: string): Promise<void> {
    // TODO: implement refresh portfolio logic
    return;
  }
} 