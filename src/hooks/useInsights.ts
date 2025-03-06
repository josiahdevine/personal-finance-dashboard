import { useState, useEffect, useCallback } from 'react';

interface Insight {
  id: string;
  type: 'spending' | 'saving' | 'investment' | 'budget';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  isRead: boolean;
  actionable: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/insights');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/insights/${id}/read`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to mark insight as read');
      }
      setInsights(prev =>
        prev.map(insight =>
          insight.id === id ? { ...insight, isRead: true } : insight
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark insight as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissInsight = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/insights/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to dismiss insight');
      }
      setInsights(prev => prev.filter(insight => insight.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss insight');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    error,
    markAsRead,
    dismissInsight,
    refreshInsights: fetchInsights
  };
}; 