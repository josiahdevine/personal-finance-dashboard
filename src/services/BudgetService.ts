import { api } from './api';

interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

interface BudgetAlert {
  category: string;
  threshold: number;
  currentSpending: number;
  percentageUsed: number;
}

export class BudgetService {
  static async getBudgets(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/budgets');
    return response;
  }

  static async createBudget(budgetData: Omit<Budget, 'id' | 'userId'>): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', budgetData);
    return response;
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const response = await api.patch<Budget>(`/budgets/${id}`, updates);
    return response;
  }

  static async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  }

  static async getBudgetAlerts(): Promise<BudgetAlert[]> {
    const response = await api.get<BudgetAlert[]>('/budgets/alerts');
    return response;
  }

  static async getBudgetProgress(
    month: string
  ): Promise<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }[]> {
    const response = await api.get('/budgets/progress', {
      params: { month }
    });
    return response;
  }
} 