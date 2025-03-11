import api from './api';
import type { CashFlowPrediction, RiskMetrics } from '../types/models';

export class AnalyticsService {
  static async getAnalytics(): Promise<{
    cashFlowPredictions: CashFlowPrediction[];
    riskMetrics: RiskMetrics;
    insights: Array<{
      type: string;
      message: string;
      severity: 'high' | 'medium' | 'low';
    }>;
  }> {
    const response = await api.get<{
      cashFlowPredictions: CashFlowPrediction[];
      riskMetrics: RiskMetrics;
      insights: Array<{
        type: string;
        message: string;
        severity: 'high' | 'medium' | 'low';
      }>;
    }>('/api/analytics');

    return response;
  }

  static async getCashFlowPredictions(): Promise<CashFlowPrediction[]> {
    const response = await api.get<CashFlowPrediction[]>('/api/analytics/cash-flow');
    return response;
  }

  static async getRiskMetrics(): Promise<RiskMetrics> {
    const response = await api.get<RiskMetrics>('/api/analytics/risk');
    return response;
  }

  static async getSpendingByCategory(startDate?: string, endDate?: string): Promise<{ [key: string]: number }> {
    const params = { startDate, endDate };
    const response = await api.get<{ [key: string]: number }>('/api/analytics/spending', { params });
    return response;
  }

  static async getIncomeBySource(startDate?: string, endDate?: string): Promise<{ [key: string]: number }> {
    const params = { startDate, endDate };
    const response = await api.get<{ [key: string]: number }>('/api/analytics/income', { params });
    return response;
  }

  static async getNetWorthTrend(period: 'week' | 'month' | 'year' = 'month'): Promise<Array<{ date: string; value: number }>> {
    const response = await api.get<Array<{ date: string; value: number }>>('/api/analytics/net-worth', {
      params: { period }
    });
    return response;
  }
} 