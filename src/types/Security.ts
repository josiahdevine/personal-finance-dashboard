export interface Security {
  id: string;
  tickerSymbol: string;
  name: string;
  type: string;
  closePrice?: number;
  closePriceAsOf?: string;
  isin?: string;
  cusip?: string;
  currencyCode?: string;
  isCashEquivalent?: boolean;
  createdAt: string;
  updatedAt: string;
} 