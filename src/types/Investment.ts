export interface InvestmentAccount {
    id: string;
    user_id: string;
    plaid_item_id?: string;
    plaid_account_id?: string;
    name: string;
    type: 'investment' | 'retirement' | 'checking' | 'savings';
    subtype: string;
    institution_name: string;
    institution_logo_url?: string;
    balance: number;
    available_balance?: number;
    currency_code: string;
    is_manual: boolean;
    is_hidden: boolean;
    is_closed: boolean;
    last_updated?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Security {
    id: string;
    ticker_symbol?: string;
    name: string;
    type: string;
    close_price?: number;
    close_price_as_of?: string;
    isin?: string;
    cusip?: string;
    currency_code: string;
    is_cash_equivalent: boolean;
    created_at: string;
    updated_at: string;
}

export interface InvestmentHolding {
    id: string;
    investment_account_id: string;
    security_id: string;
    cost_basis?: number;
    quantity: number;
    value: number;
    institution_value?: number;
    institution_price?: number;
    institution_price_as_of?: string;
    is_manual: boolean;
    created_at: string;
    updated_at: string;
    security?: Security;
}

export interface InvestmentTransaction {
    id: string;
    investment_account_id: string;
    security_id?: string;
    transaction_type: string;
    amount: number;
    quantity?: number;
    price?: number;
    fees?: number;
    date: string;
    name?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    security?: Security;
}

export interface PortfolioSummary {
    totalValue: number;
    cashValue: number;
    investedValue: number;
    totalGain: number;
    totalGainPercentage: number;
    assetAllocation: AssetClassAllocation[];
    sectorAllocation: SectorAllocation[];
    securities: SecurityAllocation[];
    riskMetrics: RiskMetrics;
    performanceMetrics: PerformanceMetrics;
}

export interface AssetClassAllocation {
    assetClass: string;
    value: number;
    percentage: number;
    securities: SecurityAllocation[];
}

export interface SectorAllocation {
    sector: string;
    value: number;
    percentage: number;
    securities: SecurityAllocation[];
}

export interface SecurityAllocation {
    securityId: string;
    ticker?: string;
    name: string;
    value: number;
    percentage: number;
    quantity: number;
    price: number;
    costBasis?: number;
    gain?: number;
    gainPercentage?: number;
}

export interface RiskMetrics {
    sharpeRatio?: number;
    beta?: number;
    alpha?: number;
    standardDeviation?: number;
    maxDrawdown?: number;
}

export interface PerformanceMetrics {
    daily?: number;
    weekly?: number;
    monthly?: number;
    ytd?: number;
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
    tenYear?: number;
    sinceInception?: number;
}

export interface TaxLotData {
    id: string;
    holdingId: string;
    securityId: string;
    acquisitionDate: string;
    quantity: number;
    costBasis: number;
    price: number;
    currentValue: number;
    gain: number;
    gainPercentage: number;
    holdingPeriod: number;
    isLongTerm: boolean;
}

export interface TaxHarvestOpportunity {
    securityId: string;
    ticker?: string;
    name: string;
    totalLoss: number;
    lots: TaxLotData[];
    taxSavingsEstimate: number;
    suggestedAction: 'harvest' | 'hold';
    suggestedAlternatives?: Array<{
        securityId: string;
        ticker?: string;
        name: string;
        correlation: number;
        expense_ratio?: number;
    }>;
} 