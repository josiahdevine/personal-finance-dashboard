import api from './api';

interface RiskMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  standardDeviation: number;
  maxDrawdown: number;
  volatility: number;
}

interface SecurityAllocation {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  value: number;
  weight: number;
  dayChange: number;
  dayChangePercent: number;
  ticker: string;
  costBasis?: number;
  gain?: number;
  gainPercentage?: number;
}

interface AssetClassAllocation {
  name: string;
  assetClass: string;
  value: number;
  percentage: number;
  securities: SecurityAllocation[];
}

interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  cashValue: number;
  riskMetrics: RiskMetrics;
  assetAllocation: AssetClassAllocation[];
}

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  try {
    const response = await api.get<PortfolioSummary>('/portfolio/summary');
    return response;
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    throw error;
  }
};

export const getAssetAllocation = async (): Promise<AssetClassAllocation[]> => {
  try {
    const response = await api.get<AssetClassAllocation[]>('/portfolio/allocation');
    return response;
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    throw error;
  }
};

export const getSecurityAllocations = async (): Promise<SecurityAllocation[]> => {
  try {
    const response = await api.get<SecurityAllocation[]>('/portfolio/securities');
    return response;
  } catch (error) {
    console.error('Error fetching security allocations:', error);
    throw error;
  }
}; 