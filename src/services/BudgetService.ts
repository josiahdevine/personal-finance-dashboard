import api from './api';
import { Budget, CreateBudgetData, UpdateBudgetData, BudgetAlert } from '../types/models';

export class BudgetService {
  static async getBudgets(): Promise<Budget[]> {
    return api.get<Budget[]>('/api/budgets');
  }

  static async createBudget(data: CreateBudgetData): Promise<Budget> {
    return api.post<Budget>('/api/budgets', data);
  }

  static async updateBudget(id: string, updates: UpdateBudgetData): Promise<Budget> {
    return api.patch<Budget>(`/api/budgets/${id}`, updates);
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
    return api.get<{
      category: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentageUsed: number;
    }[]>(`/api/budgets/${id}/analytics`);
  }

  static async getBudgetHistory(id: string): Promise<{
    date: string;
    amount: number;
  }[]> {
    return api.get<{
      date: string;
      amount: number;
    }[]>(`/api/budgets/${id}/history`);
  }

  static async getBudgetAlerts(): Promise<BudgetAlert[]> {
    return api.get<BudgetAlert[]>('/api/budgets/alerts');
  }

  static async getBudgetProgress(month: string): Promise<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }[]> {
    return api.get<{
      category: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentageUsed: number;
    }[]>('/api/budgets/progress', {
      params: { month }
    });
  }
}