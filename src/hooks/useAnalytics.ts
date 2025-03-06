import { useState, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { AnalyticsService } from '../services/AnalyticsService';
import type { AnalyticsData } from '../types/models';

export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const {
    execute: fetchAnalytics,
    isLoading: loadingAnalytics,
    error: loadError
  } = useAsyncAction<never[], AnalyticsData>(async () => {
    const data = await AnalyticsService.getAnalytics();
    setAnalyticsData(data);
    return data;
  });

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analyticsData,
    loadingAnalytics,
    loadError,
    refreshAnalytics: fetchAnalytics
  };
} 