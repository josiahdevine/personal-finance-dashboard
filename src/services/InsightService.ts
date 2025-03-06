import api from './api';

interface InsightPreferences {
  types: string[];
  minSeverity: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const getInsights = async (
  startDate?: string,
  endDate?: string,
  types?: string[],
  minSeverity?: string
): Promise<Insight[]> => {
  try {
    const { data } = await api.get<Insight[]>('/insights', {
      params: {
        startDate,
        endDate,
        types: types?.join(','),
        minSeverity
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

export const generateInsights = async (): Promise<Insight[]> => {
  try {
    const { data } = await api.post<Insight[]>('/insights/generate');
    return data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

export const dismissInsight = async (id: string): Promise<void> => {
  try {
    await api.post(`/insights/${id}/dismiss`);
  } catch (error) {
    console.error('Error dismissing insight:', error);
    throw error;
  }
};

export const getInsightPreferences = async (): Promise<InsightPreferences> => {
  try {
    const { data } = await api.get<InsightPreferences>('/insights/preferences');
    return data;
  } catch (error) {
    console.error('Error fetching insight preferences:', error);
    throw error;
  }
};

export const updateInsightPreferences = async (
  preferences: Partial<InsightPreferences>
): Promise<InsightPreferences> => {
  try {
    const { data } = await api.put<InsightPreferences>('/insights/preferences', preferences);
    return data;
  } catch (error) {
    console.error('Error updating insight preferences:', error);
    throw error;
  }
}; 