export type FrequencyType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
export type ModelType = 'time-series' | 'recurring-transaction' | 'hybrid';
export type TimeframeType = 'daily' | 'weekly' | 'monthly';
export type StatusType = 'excellent' | 'good' | 'fair' | 'poor';

export interface RecurringTransaction {
    id: string;
    userId: string;
    merchantName: string;
    amount: number;
    frequency: FrequencyType;
    dayOfMonth?: number;
    lastDate: string;
    nextPredictedDate: string;
    category?: string;
    confidence: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CashFlowPrediction {
    id: string;
    userId: string;
    predictionDate: string;
    amount: number;
    confidenceLow: number;
    confidenceHigh: number;
    modelType: ModelType;
    timeframe: TimeframeType;
    createdAt: string;
}

export interface PredictionModelMetrics {
    id: string;
    userId: string;
    modelType: ModelType;
    accuracy: number;
    meanAbsoluteError: number;
    meanSquaredError: number;
    rootMeanSquaredError: number;
    validationStartDate: string;
    validationEndDate: string;
    createdAt: string;
}

export interface FinancialHealthScore {
    id: string;
    userId: string;
    overallScore: number;
    emergencySavingsScore: number;
    debtScore: number;
    retirementScore: number;
    spendingScore: number;
    insuranceScore: number;
    creditScore: number;
    status: StatusType;
    calculatedAt: string;
}

export interface CashFlowPredictionConfig {
    modelType: ModelType;
    timeframeInDays: number;
    includePendingTransactions: boolean;
    includeRecurringTransactions: boolean;
    confidenceLevel: number; // Between 0-1, e.g., 0.95 for 95% confidence
}

export interface TimeSeriesDataPoint {
    date: Date;
    value: number;
}

export interface RecurringTransactionPrediction {
    date: Date;
    amount: number;
    merchantName: string;
    category?: string;
    confidence: number;
    isIncome: boolean;
}

export interface CashFlowPredictionResult {
    dailyPredictions: Array<{
        date: string;
        cashFlow: number;
        confidenceLow: number;
        confidenceHigh: number;
        recurringTransactions: RecurringTransactionPrediction[];
    }>;
    weeklyPredictions: Array<{
        startDate: string;
        endDate: string;
        cashFlow: number;
        confidenceLow: number;
        confidenceHigh: number;
    }>;
    monthlyPredictions: Array<{
        month: string;
        cashFlow: number;
        confidenceLow: number;
        confidenceHigh: number;
    }>;
    totalPrediction: {
        cashFlow: number;
        confidenceLow: number;
        confidenceHigh: number;
    };
    alerts: Array<{
        date: string;
        type: 'negative-balance' | 'large-expense' | 'unusual-activity';
        message: string;
        severity: 'low' | 'medium' | 'high';
        relatedTransactions?: RecurringTransactionPrediction[];
    }>;
} 