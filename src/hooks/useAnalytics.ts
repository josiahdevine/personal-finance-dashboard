import { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';

interface AssetData {
  type: string;
  value: number;
  color: string;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

interface RiskMetrics {
  overallScore: number;
  factors: Array<{
    name: string;
    score: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  recommendations: string[];
}

interface TrendData {
  labels: string[];
  income: number[];
  expenses: number[];
}

interface PredictionData {
  netWorthProjections: Array<{
    date: string;
    amount: number;
  }>;
  goalProjections: Array<{
    id: string;
    name: string;
    targetDate: string;
    probability: number;
  }>;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);

  useEffect(() => {
    const analyticsService = new AnalyticsService();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assets, categories, risks, trends, preds] = await Promise.all([
          analyticsService.getAssetAllocation(),
          analyticsService.getCategoryBreakdown(),
          analyticsService.getRiskAssessment(),
          analyticsService.getTrendAnalysis(),
          analyticsService.getPredictiveAnalysis()
        ]);

        setAssetData(assets);
        setCategoryData(categories);
        setRiskMetrics(risks);
        setTrendData(trends);
        setPredictions(preds);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    error,
    assetData,
    categoryData,
    riskMetrics,
    trendData,
    predictions
  };
} 