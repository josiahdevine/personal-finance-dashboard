import { api } from './api';
import { Goal } from '../types/models';

export class GoalService {
  static async getGoals(): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/goals');
    return response;
  }

  static async createGoal(goalData: Omit<Goal, 'id' | 'userId'>): Promise<Goal> {
    const response = await api.post<Goal>('/goals', goalData);
    return response;
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const response = await api.patch<Goal>(`/goals/${id}`, updates);
    return response;
  }

  static async deleteGoal(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  }

  static async updateGoalProgress(id: string, amount: number): Promise<Goal> {
    const response = await api.post<Goal>(`/goals/${id}/progress`, { amount });
    return response;
  }

  static async getGoalAnalytics(id: string): Promise<{
    projectedCompletion: string;
    monthlyRequired: number;
    progressRate: number;
  }> {
    const response = await api.get(`/goals/${id}/analytics`);
    return response;
  }
} 