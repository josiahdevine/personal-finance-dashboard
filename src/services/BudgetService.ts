import api from './api';
import { Budget, CreateBudgetData, UpdateBudgetData, BudgetAlert } from '../types/models';

export class BudgetService {
  static async getBudgets(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/api/budgets');
    return response.data;
  }

  static async createBudget(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<Budget>('/api/budgets', data);
    return response.data;
  }

  static async updateBudget(id: string, updates: UpdateBudgetData): Promise<Budget> {
    const response = await api.patch<Budget>(`/api/budgets/${id}`, updates);
    return response.data;
  }

  static async deleteBudget(id: string): Promise<void> {
    await api.delete(`/api/budgets/${id}`);
  }

  static async getBudgetAnalytics(id: string): Promise<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }[]> {
    const response = await api.get<{
      category: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentageUsed: number;
    }[]>(`/api/budgets/${id}/analytics`);
    return response.data;
  }

  static async getBudgetHistory(id: string): Promise<{
    date: string;
    amount: number;
  }[]> {
    const response = await api.get<{
      date: string;
      amount: number;
    }[]>(`/api/budgets/${id}/history`);
    return response.data;
  }

  static async getBudgetAlerts(): Promise<BudgetAlert[]> {
    const response = await api.get<BudgetAlert[]>('/api/budgets/alerts');
    return response.data;
  }

  static async getBudgetProgress(month: string): Promise<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }[]> {
    const response = await api.get<{
      category: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentageUsed: number;
    }[]>('/api/budgets/progress', {
      params: { month }
    });
    return response.data;
  }
} 