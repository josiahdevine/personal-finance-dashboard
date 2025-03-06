import { api } from './api';

interface NetWorthData {
  date: string;
  total: number;
  breakdown: {
    assets: number;
    liabilities: number;
  };
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
}

interface BudgetAnalysis {
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
  overall: {
    totalBudgeted: number;
    totalSpent: number;
    totalRemaining: number;
  };
}

export class AnalyticsService {
  static async getNetWorthHistory(
    startDate: string,
    endDate: string
  ): Promise<NetWorthData[]> {
    const response = await api.get<NetWorthData[]>('/analytics/net-worth', {
      params: { startDate, endDate }
    });
    return response;
  }

  static async getSpendingByCategory(
    startDate: string,
    endDate: string
  ): Promise<CategorySpending[]> {
    const response = await api.get<CategorySpending[]>('/analytics/spending', {
      params: { startDate, endDate }
    });
    return response;
  }

  static async getCashFlow(
    startDate: string,
    endDate: string
  ): Promise<{
    income: { date: string; amount: number }[];
    expenses: { date: string; amount: number }[];
  }> {
    const response = await api.get('/analytics/cash-flow', {
      params: { startDate, endDate }
    });
    return response;
  }

  static async getBudgetAnalysis(month: string): Promise<BudgetAnalysis> {
    const response = await api.get<BudgetAnalysis>('/analytics/budget', {
      params: { month }
    });
    return response;
  }
} 