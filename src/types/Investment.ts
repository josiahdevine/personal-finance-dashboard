export interface AssetClassAllocation {
  name: string;
  percentage: number;
  value: number;
  color?: string;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
  value: number;
  color?: string;
}

export interface SecurityAllocation {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  weight: number;
  dayChange: number;
  dayChangePercent: number;
  securityId: string;
  ticker: string;
  percentage: number;
  quantity: number;
  costBasis: number;
}

export interface PortfolioPerformance {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  dayGain: number;
  dayGainPercentage: number;
  totalGain: number;
  totalGainPercentage: number;
  risk: number;
  sharpeRatio: number;
}

export interface PortfolioHistory {
  date: string;
  value: number;
  gain: number;
  gainPercentage: number;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  beta: number;
  alpha: number;
  maxDrawdown: number;
  standardDeviation: number;
}

export interface CashFlowPrediction {
  date: string;
  predictedValue: number;
  confidenceLow: number;
  confidenceHigh: number;
  actualValue?: number;
}

export interface ModelValidation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
}

export interface PredictionAlert {
  id: string;
  type: 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
  affectedAssets: string[];
  potentialImpact: number;
}

export interface InvestmentAccount {
  id: string;
  userId: string;
  name: string;
  type: string;
  subtype: string | null;
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
  status: 'active' | 'inactive';
  holdings: InvestmentHolding[];
}

export interface Security {
  id: string;
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
  price: number;
  priceDate: string;
  priceChange: number;
  priceChangePercent: number;
}

export interface InvestmentHolding {
  id: string;
  accountId: string;
  securityId: string;
  quantity: number;
  costBasis: number;
  value: number;
  lastUpdated: string;
  security: Security;
}

export interface InvestmentTransaction {
  id: string;
  accountId: string;
  securityId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  amount: number;
  fees: number;
  date: string;
  security: Security;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: SecurityAllocation[];
  assetAllocation: AssetClassAllocation[];
  sectorAllocation: SectorAllocation[];
  performance: PortfolioPerformance[];
  riskMetrics: RiskMetrics;
}

export interface TaxLotData {
  id: string;
  holdingId: string;
  securityId: string;
  quantity: number;
  costBasis: number;
  acquiredAt: string;
  isWashSale: boolean;
  washSaleDisallowedLoss?: number;
}

export interface TaxHarvestOpportunity {
  securityId: string;
  ticker: string;
  name: string;
  totalQuantity: number;
  totalValue: number;
  totalCostBasis: number;
  unrealizedLoss: number;
  unrealizedLossPercent: number;
  lots: TaxLotData[];
  recommendedAction: 'harvest' | 'hold';
  alternativeInvestments?: {
    ticker: string;
    name: string;
    correlation: number;
  }[];
} 