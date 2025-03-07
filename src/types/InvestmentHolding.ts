export interface InvestmentHolding {
  id: string;
  investmentAccountId: string;
  securityId: string;
  costBasis: number;
  institutionValue?: number;
  institutionPrice?: number;
  institutionPriceAsOf?: string;
  isManual?: boolean;
  quantity: number;
  value: number;
  createdAt: string;
  updatedAt: string;
} 