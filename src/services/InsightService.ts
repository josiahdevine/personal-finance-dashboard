import { api } from './api';

interface Insight {
  id: string;
  type: 'spending' | 'saving' | 'budget' | 'goal';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert';
  metadata: Record<string, any>;
  createdAt: string;
}

export class InsightService {
  static async getInsights(): Promise<Insight[]> {
    const response = await api.get<Insight[]>('/insights');
    return response;
  }

  static async generateInsights(): Promise<Insight[]> {
    const response = await api.post<Insight[]>('/insights/generate');
    return response;
  }

  static async dismissInsight(id: string): Promise<void> {
    await api.post(`/insights/${id}/dismiss`);
  }

  static async getInsightPreferences(): Promise<{
    types: string[];
    minSeverity: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }> {
    const response = await api.get('/insights/preferences');
    return response;
  }

  static async updateInsightPreferences(preferences: {
    types?: string[];
    minSeverity?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  }): Promise<void> {
    await api.patch('/insights/preferences', preferences);
  }
} 