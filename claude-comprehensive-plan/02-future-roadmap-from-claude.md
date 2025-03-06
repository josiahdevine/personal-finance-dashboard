# Detailed Implementation Plan for Finance Intelligence Suite

Based on the existing codebase and our previous discussions, I'll provide a comprehensive implementation plan for the Finance Intelligence Suite. This will cover the Cash Flow Prediction Engine, Investment Portfolio Analysis, and Financial Health Score System in depth.

## 1. Cash Flow Prediction Engine Implementation

### 1.1 Data Collection & Preparation Infrastructure

#### 1.1.1 Transaction Data Service Enhancement
```typescript
// src/services/transactionDataService.ts
import { api } from './api';
import { Transaction } from '../types/Transaction';
import { dateUtils } from '../utils/dateUtils';

class TransactionDataService {
  /**
   * Fetch historical transaction data with filtering options
   */
  async getHistoricalTransactions(params: {
    startDate: string;
    endDate: string;
    categories?: string[];
    accounts?: string[];
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await api.get<{ transactions: Transaction[]; total: number }>('/transactions', {
      params,
    });
    return response;
  }

  /**
   * Get transactions grouped by date and category
   */
  async getTransactionsGroupedByDateAndCategory(params: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<{ date: string; category: string; amount: number }[]> {
    const response = await api.get<{ date: string; category: string; amount: number }[]>(
      '/transactions/grouped',
      { params }
    );
    return response;
  }

  /**
   * Get recurring transactions detected in the user's history
   */
  async getRecurringTransactions(): Promise<{
    income: RecurringTransaction[];
    expenses: RecurringTransaction[];
  }> {
    const response = await api.get<{
      income: RecurringTransaction[];
      expenses: RecurringTransaction[];
    }>('/transactions/recurring');
    return response;
  }

  /**
   * Prepare data for cash flow prediction
   */
  async prepareDataForPrediction(timeframe: 'month' | 'quarter' | 'year'): Promise<PredictionData> {
    // Calculate date range based on timeframe
    const today = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'month':
        startDate = dateUtils.subMonths(today, 6);
        break;
      case 'quarter':
        startDate = dateUtils.subMonths(today, 12);
        break;
      case 'year':
        startDate = dateUtils.subMonths(today, 24);
        break;
    }
    
    // Get transaction data
    const { transactions } = await this.getHistoricalTransactions({
      startDate: dateUtils.formatDate(startDate),
      endDate: dateUtils.formatDate(today),
      limit: 5000,
    });
    
    // Get recurring transactions
    const recurringTransactions = await this.getRecurringTransactions();
    
    // Normalize and clean data
    const cleanedData = this.normalizeAndCleanData(transactions);
    
    // Create training and validation sets
    const splitIndex = Math.floor(cleanedData.length * 0.8);
    const trainingData = cleanedData.slice(0, splitIndex);
    const validationData = cleanedData.slice(splitIndex);
    
    return {
      allTransactions: cleanedData,
      trainingData,
      validationData,
      recurringIncome: recurringTransactions.income,
      recurringExpenses: recurringTransactions.expenses,
    };
  }

  /**
   * Normalize and clean transaction data
   */
  private normalizeAndCleanData(transactions: Transaction[]): NormalizedTransaction[] {
    return transactions.map(transaction => {
      // Convert date strings to Date objects
      const date = new Date(transaction.date);
      
      // Normalize amount (expenses as negative, income as positive)
      const normalizedAmount = transaction.amount;
      
      // Categorize transaction
      const category = transaction.category || 'Uncategorized';
      
      // Create normalized transaction object
      return {
        id: transaction.id,
        date,
        amount: normalizedAmount,
        category,
        description: transaction.name || transaction.description,
        isRecurring: false, // Will be determined by recurring detection
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export const transactionDataService = new TransactionDataService();
```

#### 1.1.2 Transaction Categorization Service
```typescript
// src/services/transactionCategorizationService.ts
import { Transaction } from '../types/Transaction';

class TransactionCategorizationService {
  /**
   * Categorize a transaction based on its properties
   */
  categorizeTransaction(transaction: Transaction): string {
    // If transaction already has a category, use it
    if (transaction.category) {
      return transaction.category;
    }
    
    // Extract merchant name
    const merchantName = transaction.merchant_name || transaction.name || '';
    
    // Create a lookup map for common merchants and their categories
    const merchantCategories = this.getMerchantCategoryMap();
    
    // Check if we have a direct match
    for (const [pattern, category] of Object.entries(merchantCategories)) {
      if (merchantName.toLowerCase().includes(pattern.toLowerCase())) {
        return category;
      }
    }
    
    // Fallback to category detection based on amount and name patterns
    return this.detectCategoryFromPatterns(transaction);
  }

  /**
   * Get a mapping of merchant patterns to categories
   */
  private getMerchantCategoryMap(): Record<string, string> {
    return {
      'netflix': 'Entertainment',
      'spotify': 'Entertainment',
      'amazon': 'Shopping',
      'uber': 'Transportation',
      'lyft': 'Transportation',
      'starbucks': 'Food & Dining',
      'walmart': 'Shopping',
      'target': 'Shopping',
      'kroger': 'Groceries',
      'safeway': 'Groceries',
      'trader joe': 'Groceries',
      'whole foods': 'Groceries',
      'cvs': 'Health & Medical',
      'walgreens': 'Health & Medical',
      'verizon': 'Bills & Utilities',
      'at&t': 'Bills & Utilities',
      'comcast': 'Bills & Utilities',
      'xfinity': 'Bills & Utilities',
      'rent': 'Housing',
      'mortgage': 'Housing',
      // Add more merchant patterns and categories
    };
  }

  /**
   * Detect category based on transaction patterns
   */
  private detectCategoryFromPatterns(transaction: Transaction): string {
    const description = (transaction.name || '').toLowerCase();
    const amount = transaction.amount;
    
    // Large recurring payments are likely housing
    if (amount > 1000 && amount < 5000) {
      return 'Housing';
    }
    
    // Check for salary/income patterns
    if (amount > 500 && (
      description.includes('deposit') ||
      description.includes('payroll') ||
      description.includes('direct dep') ||
      description.includes('salary')
    )) {
      return 'Income';
    }
    
    // Check for utility patterns
    if (description.includes('electric') ||
        description.includes('water') ||
        description.includes('gas') ||
        description.includes('utility') ||
        description.includes('bill pay')) {
      return 'Bills & Utilities';
    }
    
    // Default category if no patterns match
    return 'Uncategorized';
  }
}

export const transactionCategorizationService = new TransactionCategorizationService();
```

#### 1.1.3 Recurring Transaction Detection
```typescript
// src/services/recurringTransactionService.ts
import { Transaction } from '../types/Transaction';
import { dateUtils } from '../utils/dateUtils';

interface RecurringTransactionGroup {
  transactions: Transaction[];
  merchantName: string;
  averageAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  lastDate: Date;
  nextPredictedDate: Date;
  dayOfMonth?: number;
  confidence: number;
}

class RecurringTransactionService {
  /**
   * Detect recurring transactions from a set of transactions
   */
  detectRecurringTransactions(transactions: Transaction[]): {
    income: RecurringTransactionGroup[];
    expenses: RecurringTransactionGroup[];
  } {
    // Group transactions by similar merchant name and amount
    const groups = this.groupSimilarTransactions(transactions);
    
    // Detect recurring patterns in each group
    const recurringGroups = groups
      .map(group => this.detectRecurringPattern(group))
      .filter(group => group.frequency !== null) as RecurringTransactionGroup[];
    
    // Split into income and expenses
    const income = recurringGroups.filter(group => group.averageAmount > 0);
    const expenses = recurringGroups.filter(group => group.averageAmount < 0);
    
    return { income, expenses };
  }

  /**
   * Group transactions by similar merchant name and amount
   */
  private groupSimilarTransactions(transactions: Transaction[]): {
    transactions: Transaction[];
    merchantName: string;
    averageAmount: number;
  }[] {
    const groups: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      const merchantName = transaction.merchant_name || transaction.name || '';
      // Round amount to nearest dollar to group similar transactions
      const roundedAmount = Math.round(transaction.amount);
      
      const key = `${merchantName}|${roundedAmount}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(transaction);
    });
    
    // Filter groups to only include those with at least 2 transactions
    return Object.entries(groups)
      .filter(([_, txns]) => txns.length >= 2)
      .map(([key, txns]) => {
        const [merchantName] = key.split('|');
        // Calculate the actual average amount (not the rounded value)
        const averageAmount = txns.reduce((sum, txn) => sum + txn.amount, 0) / txns.length;
        
        return {
          transactions: txns,
          merchantName,
          averageAmount,
        };
      });
  }

  /**
   * Detect recurring pattern in a group of transactions
   */
  private detectRecurringPattern(group: {
    transactions: Transaction[];
    merchantName: string;
    averageAmount: number;
  }): RecurringTransactionGroup | null {
    // Sort transactions by date
    const sortedTransactions = [...group.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Need at least 2 transactions to detect a pattern
    if (sortedTransactions.length < 2) {
      return null;
    }
    
    // Calculate intervals between consecutive transactions
    const intervals: number[] = [];
    for (let i = 1; i < sortedTransactions.length; i++) {
      const prevDate = new Date(sortedTransactions[i - 1].date);
      const currDate = new Date(sortedTransactions[i].date);
      const daysDiff = dateUtils.differenceInDays(currDate, prevDate);
      intervals.push(daysDiff);
    }
    
    // Determine frequency based on the average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const stdDev = this.calculateStandardDeviation(intervals);
    
    // Check for various frequencies
    let frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | null = null;
    
    if (avgInterval >= 25 && avgInterval <= 31 && stdDev <= 3) {
      frequency = 'monthly';
    } else if (avgInterval >= 13 && avgInterval <= 15 && stdDev <= 2) {
      frequency = 'biweekly';
    } else if (avgInterval >= 6 && avgInterval <= 8 && stdDev <= 1) {
      frequency = 'weekly';
    } else if (avgInterval >= 89 && avgInterval <= 92 && stdDev <= 5) {
      frequency = 'quarterly';
    } else if (avgInterval >= 350 && avgInterval <= 380 && stdDev <= 10) {
      frequency = 'annual';
    }
    
    if (!frequency) {
      return null;
    }
    
    // Calculate confidence based on number of transactions and consistency
    const confidence = this.calculateConfidence(
      sortedTransactions.length,
      stdDev,
      frequency
    );
    
    // Get last transaction date
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
    const lastDate = new Date(lastTransaction.date);
    
    // Predict next date
    const nextPredictedDate = this.predictNextDate(lastDate, frequency);
    
    // Determine day of month for monthly transactions
    let dayOfMonth: number | undefined;
    if (frequency === 'monthly') {
      // For monthly transactions, check if they occur on the same day of month
      const daysOfMonth = sortedTransactions.map(txn => new Date(txn.date).getDate());
      const uniqueDays = [...new Set(daysOfMonth)];
      
      // If all transactions fall on the same day of month (or close to it)
      if (uniqueDays.length === 1 || 
         (uniqueDays.length === 2 && Math.abs(uniqueDays[0] - uniqueDays[1]) <= 1)) {
        dayOfMonth = Math.round(
          daysOfMonth.reduce((sum, day) => sum + day, 0) / daysOfMonth.length
        );
      }
    }
    
    return {
      transactions: sortedTransactions,
      merchantName: group.merchantName,
      averageAmount: group.averageAmount,
      frequency,
      lastDate,
      nextPredictedDate,
      dayOfMonth,
      confidence,
    };
  }

  /**
   * Predict the next date based on frequency and last date
   */
  private predictNextDate(lastDate: Date, frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'): Date {
    const nextDate = new Date(lastDate);
    
    switch (frequency) {
      case 'weekly':
        return dateUtils.addDays(nextDate, 7);
      case 'biweekly':
        return dateUtils.addDays(nextDate, 14);
      case 'monthly':
        return dateUtils.addMonths(nextDate, 1);
      case 'quarterly':
        return dateUtils.addMonths(nextDate, 3);
      case 'annual':
        return dateUtils.addYears(nextDate, 1);
    }
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate confidence score for recurring pattern detection
   */
  private calculateConfidence(
    transactionCount: number,
    standardDeviation: number,
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'
  ): number {
    // Base confidence from transaction count (more transactions = higher confidence)
    let baseConfidence = Math.min(0.3 + transactionCount * 0.1, 0.7);
    
    // Adjust for standard deviation (lower deviation = higher confidence)
    const maxDeviation = {
      weekly: 1,
      biweekly: 2,
      monthly: 3,
      quarterly: 5,
      annual: 10,
    }[frequency];
    
    const deviationFactor = Math.max(0, 1 - standardDeviation / maxDeviation);
    
    // Combine factors and convert to percentage
    const combinedConfidence = baseConfidence * 0.7 + deviationFactor * 0.3;
    
    return Math.round(combinedConfidence * 100);
  }
}

export const recurringTransactionService = new RecurringTransactionService();
```

### 1.2 Model Development Implementation

#### 1.2.1 Statistical Time Series Model
```typescript
// src/models/cashFlowPrediction/timeSeriesModel.ts
import * as math from 'mathjs';
import { dateUtils } from '../../utils/dateUtils';

interface TimeSeriesDataPoint {
  date: Date;
  value: number;
}

interface TimeSeriesModelParams {
  seasonality?: number; // Length of seasonal pattern (e.g., 7 for weekly, 30 for monthly)
  historyDays?: number; // Days of history to consider for predictions
  smoothingFactor?: number; // Exponential smoothing factor (0-1)
}

interface TimeSeriesPrediction {
  date: Date;
  value: number;
  confidenceLow: number;
  confidenceHigh: number;
}

class TimeSeriesModel {
  private params: Required<TimeSeriesModelParams>;

  constructor(params: TimeSeriesModelParams = {}) {
    this.params = {
      seasonality: params.seasonality || 30, // Default to monthly seasonality
      historyDays: params.historyDays || 180, // Default to 6 months of history
      smoothingFactor: params.smoothingFactor || 0.3, // Default smoothing factor
    };
  }

  /**
   * Generate time series predictions using exponential smoothing with seasonality
   */
  predict(
    data: TimeSeriesDataPoint[],
    daysToPredict: number
  ): TimeSeriesPrediction[] {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Filter to recent history based on historyDays parameter
    const cutoffDate = dateUtils.subDays(new Date(), this.params.historyDays);
    const recentData = sortedData.filter(point => point.date >= cutoffDate);
    
    // Calculate seasonal indices
    const seasonalIndices = this.calculateSeasonalIndices(recentData, this.params.seasonality);
    
    // Calculate trend
    const trend = this.calculateTrend(recentData);
    
    // Generate predictions
    const lastDate = recentData[recentData.length - 1].date;
    const predictions: TimeSeriesPrediction[] = [];
    
    for (let i = 1; i <= daysToPredict; i++) {
      const predictionDate = dateUtils.addDays(lastDate, i);
      
      // Determine the seasonal index for this date
      const dayOfSeason = i % this.params.seasonality;
      const seasonalIndex = seasonalIndices[dayOfSeason] || 1;
      
      // Calculate base prediction with trend
      const basePrediction = this.calculateBasePrediction(recentData, trend, i);
      
      // Apply seasonal adjustment
      const adjustedPrediction = basePrediction * seasonalIndex;
      
      // Calculate confidence interval (wider for further predictions)
      const confidenceInterval = this.calculateConfidenceInterval(basePrediction, i, recentData);
      
      predictions.push({
        date: predictionDate,
        value: adjustedPrediction,
        confidenceLow: adjustedPrediction - confidenceInterval,
        confidenceHigh: adjustedPrediction + confidenceInterval,
      });
    }
    
    return predictions;
  }

  /**
   * Calculate seasonal indices from historical data
   */
  private calculateSeasonalIndices(
    data: TimeSeriesDataPoint[],
    seasonalityPeriod: number
  ): number[] {
    // Group data by position in seasonality cycle
    const seasonalGroups: Record<number, number[]> = {};
    const startDate = data[0].date;
    
    data.forEach(point => {
      const daysFromStart = dateUtils.differenceInDays(point.date, startDate);
      const positionInCycle = daysFromStart % seasonalityPeriod;
      
      if (!seasonalGroups[positionInCycle]) {
        seasonalGroups[positionInCycle] = [];
      }
      
      seasonalGroups[positionInCycle].push(point.value);
    });
    
    // Calculate average values for each position
    const allValues = data.map(point => point.value);
    const globalAverage = allValues.reduce((sum, val) => sum + val, 0) / allValues.length || 1;
    
    // Calculate indices
    const indices: number[] = [];
    
    for (let i = 0; i < seasonalityPeriod; i++) {
      if (seasonalGroups[i] && seasonalGroups[i].length > 0) {
        const groupAvg = seasonalGroups[i].reduce((sum, val) => sum + val, 0) / seasonalGroups[i].length;
        indices[i] = groupAvg / globalAverage;
      } else {
        // If we don't have data for this position, use 1 (no adjustment)
        indices[i] = 1;
      }
    }
    
    return indices;
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(data: TimeSeriesDataPoint[]): number {
    if (data.length < 2) return 0;
    
    // Simple linear regression
    const xValues = data.map((_, i) => i);
    const yValues = data.map(point => point.value);
    
    const n = data.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    // Calculate slope (trend)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
    
    return slope;
  }

  /**
   * Calculate base prediction using exponential smoothing
   */
  private calculateBasePrediction(
    data: TimeSeriesDataPoint[],
    trend: number,
    daysAhead: number
  ): number {
    if (data.length === 0) return 0;
    
    // Get most recent values
    const recentValues = data.slice(-5).map(point => point.value);
    const lastValue = recentValues[recentValues.length - 1];
    
    // Apply exponential smoothing
    const alpha = this.params.smoothingFactor;
    let smoothedValue = recentValues[0];
    
    for (let i = 1; i < recentValues.length; i++) {
      smoothedValue = alpha * recentValues[i] + (1 - alpha) * smoothedValue;
    }
    
    // Add trend component
    return smoothedValue + trend * daysAhead;
  }

  /**
   * Calculate confidence interval width that grows with prediction distance
   */
  private calculateConfidenceInterval(
    prediction: number,
    daysAhead: number,
    historicalData: TimeSeriesDataPoint[]
  ): number {
    // Calculate standard deviation of historical data
    const values = historicalData.map(point => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(variance);
    
    // Base interval on standard deviation
    const baseInterval = stdDev;
    
    // Widen interval based on how far ahead we're predicting
    // This grows with the square root of distance to avoid excessive widening
    const growthFactor = Math.sqrt(daysAhead / 10);
    
    // Scale interval based on prediction value
    const relativeInterval = Math.abs(prediction) * 0.1 * growthFactor;
    
    return Math.max(baseInterval, relativeInterval);
  }
}

export { TimeSeriesModel, TimeSeriesDataPoint, TimeSeriesPrediction };
```

#### 1.2.2 Cash Flow Model Factory
```typescript
// src/models/cashFlowPrediction/modelFactory.ts
import { TimeSeriesModel, TimeSeriesDataPoint } from './timeSeriesModel';
import { RecurringTransactionModel } from './recurringTransactionModel';
import { Transaction } from '../../types/Transaction';
import { dateUtils } from '../../utils/dateUtils';

// Define model types
type ModelType = 'time-series' | 'recurring-transaction' | 'hybrid';

interface CashFlowPredictionConfig {
  modelType: ModelType;
  timeframeInDays: number;
  includePendingTransactions: boolean;
  includeRecurringTransactions: boolean;
  confidenceLevel: number; // Between 0-1, e.g., 0.95 for 95% confidence
}

class CashFlowModelFactory {
  /**
   * Create a prediction model based on configuration
   */
  createModel(config: CashFlowPredictionConfig) {
    switch (config.modelType) {
      case 'time-series':
        return new TimeSeriesModel({
          seasonality: 30, // Monthly seasonality
          historyDays: 180, // 6 months of history
          smoothingFactor: 0.3,
        });
        
      case 'recurring-transaction':
        return new RecurringTransactionModel({
          minimumConfidence: config.confidenceLevel * 100,
          includeUncategorized: false,
        });
        
      case 'hybrid':
        return this.createHybridModel(config);
        
      default:
        return new TimeSeriesModel(); // Default to time series model
    }
  }

  /**
   * Create a hybrid model that combines time series and recurring transaction models
   */
  private createHybridModel(config: CashFlowPredictionConfig) {
    // Create both model types
    const timeSeriesModel = new TimeSeriesModel({
      seasonality: 30,
      historyDays: 180,
      smoothingFactor: 0.3,
    });
    
    const recurringModel = new RecurringTransactionModel({
      minimumConfidence: config.confidenceLevel * 100,
      includeUncategorized: false,
    });
    
    // Return an object with methods that combine both models
    return {
      predict: (
        transactions: Transaction[],
        recurringTransactions: any[],
        daysToPredict: number
      ) => {
        // First, generate the time series prediction
        const timeSeriesData: TimeSeriesDataPoint[] = this.prepareTimeSeriesData(transactions);
        const timeSeriesPrediction = timeSeriesModel.predict(timeSeriesData, daysToPredict);
        
        // Then, get the recurring transaction prediction
        const recurringPrediction = recurringModel.predict(recurringTransactions, daysToPredict);
        
        // Combine the predictions
        return this.combineModels(timeSeriesPrediction, recurringPrediction);
      }
    };
  }

  /**
   * Prepare transaction data for time series analysis
   */
  private prepareTimeSeriesData(transactions: Transaction[]): TimeSeriesDataPoint[] {
    // Group transactions by date
    const groupedByDate: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const dateStr = transaction.date.substring(0, 10); // YYYY-MM-DD format
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = 0;
      }
      
      groupedByDate[dateStr] += transaction.amount;
    });
    
    // Convert to time series data points
    return Object.entries(groupedByDate).map(([dateStr, value]) => ({
      date: new Date(dateStr),
      value,
    }));
  }

  /**
   * Combine predictions from multiple models
   */
  private combineModels(timeSeriesPredictions: any[], recurringPredictions: any[]): any[] {
    // Create a map of dates to predictions
    const combinedPredictions: Record<string, any> = {};
    
    // Add time series predictions to the map
    timeSeriesPredictions.forEach(prediction => {
      const dateStr = dateUtils.formatDate(prediction.date);
      combinedPredictions[dateStr] = {
        date: prediction.date,
        timeSeriesValue: prediction.value,
        confidenceLow: prediction.confidenceLow,
        confidenceHigh: prediction.confidenceHigh,
        recurringTransactions: [],
      };
    });
    
    // Add recurring transactions to the map
    recurringPredictions.forEach(recurringTx => {
      const dateStr = dateUtils.formatDate(recurringTx.date);
      
      if (!combinedPredictions[dateStr]) {
        combinedPredictions[dateStr] = {
          date: recurringTx.date,
          timeSeriesValue: 0,
          confidenceLow: 0,
          confidenceHigh: 0,
          recurringTransactions: [],
        };
      }
      
      combinedPredictions[dateStr].recurringTransactions.push(recurringTx);
    });
    
    // Calculate final values
    const result = Object.values(combinedPredictions).map(combined => {
      // Sum up recurring transaction amounts
      const recurringAmount = combined.recurringTransactions.reduce(
        (sum: number, tx: any) => sum + tx.amount,
        0
      );
      
      // Weight the time series prediction and recurring transaction differently
      // For days with recurring transactions, give more weight to recurring
      const hasRecurring = combined.recurringTransactions.length > 0;
      const timeSeriesWeight = hasRecurring ? 0.3 : 0.8;
      const recurringWeight = hasRecurring ? 0.7 : 0.2;
      
      // Calculate combined prediction
      const combinedValue = 
        combined.timeSeriesValue * timeSeriesWeight + 
        recurringAmount * recurringWeight;
      
      // Adjust confidence intervals
      const confidenceAdjustment = hasRecurring ? 0.6 : 1.0; // Tighter intervals when we have recurring data
      const adjustedConfidenceLow = combinedValue - (combinedValue - combined.confidenceLow) * confidenceAdjustment;
      const adjustedConfidenceHigh = combinedValue + (combined.confidenceHigh - combinedValue) * confidenceAdjustment;
      
      return {
        date: combined.date,
        value: combinedValue,
        confidenceLow: adjustedConfidenc
eLow,
        confidenceHigh: adjustedConfidenceHigh,
        recurringTransactions: combined.recurringTransactions,
        timeSeriesComponent: combined.timeSeriesValue,
        recurringComponent: recurringAmount,
      };
    });
    
    // Sort by date
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export { CashFlowModelFactory, CashFlowPredictionConfig, ModelType };
```

#### 1.2.3 Recurring Transaction Model
```typescript
// src/models/cashFlowPrediction/recurringTransactionModel.ts
import { dateUtils } from '../../utils/dateUtils';

interface RecurringTransaction {
  id: string;
  merchantName: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  lastDate: Date;
  nextPredictedDate: Date;
  dayOfMonth?: number;
  confidence: number;
  category: string;
}

interface RecurringTransactionPrediction {
  date: Date;
  amount: number;
  merchantName: string;
  category: string;
  confidence: number;
  isIncome: boolean;
}

interface RecurringTransactionModelParams {
  minimumConfidence: number; // Minimum confidence level (0-100)
  includeUncategorized: boolean; // Whether to include uncategorized transactions
}

class RecurringTransactionModel {
  private params: RecurringTransactionModelParams;

  constructor(params: RecurringTransactionModelParams) {
    this.params = params;
  }

  /**
   * Predict future occurrences of recurring transactions
   */
  predict(
    recurringTransactions: RecurringTransaction[],
    daysToPredict: number
  ): RecurringTransactionPrediction[] {
    // Filter transactions based on confidence threshold
    const filteredTransactions = recurringTransactions.filter(
      txn => txn.confidence >= this.params.minimumConfidence &&
            (this.params.includeUncategorized || txn.category !== 'Uncategorized')
    );
    
    const startDate = new Date();
    const endDate = dateUtils.addDays(startDate, daysToPredict);
    const predictions: RecurringTransactionPrediction[] = [];
    
    // For each recurring transaction, predict future occurrences
    filteredTransactions.forEach(recurringTx => {
      const occurrences = this.predictOccurrences(recurringTx, startDate, endDate);
      predictions.push(...occurrences);
    });
    
    // Sort predictions by date
    return predictions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Predict future occurrences of a single recurring transaction
   */
  private predictOccurrences(
    transaction: RecurringTransaction,
    startDate: Date,
    endDate: Date
  ): RecurringTransactionPrediction[] {
    const occurrences: RecurringTransactionPrediction[] = [];
    
    // Start from the next predicted date
    let currentDate = new Date(transaction.nextPredictedDate);
    
    // Predict occurrences until the end date
    while (currentDate <= endDate) {
      // Only include occurrences after the start date
      if (currentDate >= startDate) {
        occurrences.push({
          date: new Date(currentDate), // Clone date to avoid reference issues
          amount: transaction.amount,
          merchantName: transaction.merchantName,
          category: transaction.category,
          confidence: transaction.confidence,
          isIncome: transaction.amount > 0,
        });
      }
      
      // Calculate the next occurrence based on frequency
      currentDate = this.calculateNextOccurrence(currentDate, transaction);
    }
    
    return occurrences;
  }

  /**
   * Calculate the next occurrence of a recurring transaction
   */
  private calculateNextOccurrence(
    currentDate: Date,
    transaction: RecurringTransaction
  ): Date {
    const nextDate = new Date(currentDate);
    
    switch (transaction.frequency) {
      case 'weekly':
        return dateUtils.addDays(nextDate, 7);
        
      case 'biweekly':
        return dateUtils.addDays(nextDate, 14);
        
      case 'monthly':
        // If we have a specific day of month, try to maintain it
        if (transaction.dayOfMonth) {
          const nextMonth = dateUtils.addMonths(nextDate, 1);
          nextMonth.setDate(1); // First of month
          
          // Try to set to the specified day
          const lastDayOfMonth = new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1,
            0
          ).getDate();
          
          // Use the specified day, but don't exceed the last day of the month
          const adjustedDay = Math.min(transaction.dayOfMonth, lastDayOfMonth);
          nextMonth.setDate(adjustedDay);
          
          return nextMonth;
        }
        
        // Otherwise just add a month
        return dateUtils.addMonths(nextDate, 1);
        
      case 'quarterly':
        return dateUtils.addMonths(nextDate, 3);
        
      case 'annual':
        return dateUtils.addYears(nextDate, 1);
        
      default:
        // Default to monthly if frequency is unknown
        return dateUtils.addMonths(nextDate, 1);
    }
  }
}

export { RecurringTransactionModel, RecurringTransaction, RecurringTransactionPrediction };
```

### 1.3 Prediction Engine Implementation

#### 1.3.1 Cash Flow Prediction Service
```typescript
// src/services/cashFlowPredictionService.ts
import { transactionDataService } from './transactionDataService';
import { CashFlowModelFactory, CashFlowPredictionConfig } from '../models/cashFlowPrediction/modelFactory';
import { transactionCategorizationService } from './transactionCategorizationService';

interface CashFlowPredictionResult {
  dailyPredictions: Array<{
    date: string;
    cashFlow: number;
    confidenceLow: number;
    confidenceHigh: number;
    recurringTransactions: any[];
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
    relatedTransactions?: any[];
  }>;
}

class CashFlowPredictionService {
  private modelFactory: CashFlowModelFactory;
  
  constructor() {
    this.modelFactory = new CashFlowModelFactory();
  }
  
  /**
   * Generate cash flow predictions
   */
  async generatePredictions(
    userId: string,
    config: Partial<CashFlowPredictionConfig> = {}
  ): Promise<CashFlowPredictionResult> {
    // Default configuration
    const defaultConfig: CashFlowPredictionConfig = {
      modelType: 'hybrid',
      timeframeInDays: 90, // 3 months
      includePendingTransactions: true,
      includeRecurringTransactions: true,
      confidenceLevel: 0.95, // 95% confidence
    };
    
    // Merge provided config with defaults
    const mergedConfig = { ...defaultConfig, ...config };
    
    // Prepare data for prediction
    const predictionData = await this.preparePredictionData(userId, mergedConfig);
    
    // Create model
    const model = this.modelFactory.createModel(mergedConfig);
    
    // Generate predictions
    const dailyPredictions = model.predict(
      predictionData.transactions,
      predictionData.recurringTransactions,
      mergedConfig.timeframeInDays
    );
    
    // Derive weekly and monthly predictions
    const weeklyPredictions = this.aggregateToWeekly(dailyPredictions);
    const monthlyPredictions = this.aggregateToMonthly(dailyPredictions);
    
    // Calculate total prediction
    const totalPrediction = this.calculateTotal(dailyPredictions);
    
    // Generate alerts
    const alerts = this.generateAlerts(dailyPredictions, predictionData);
    
    return {
      dailyPredictions: this.formatDailyPredictions(dailyPredictions),
      weeklyPredictions,
      monthlyPredictions,
      totalPrediction,
      alerts,
    };
  }
  
  /**
   * Prepare data for prediction
   */
  private async preparePredictionData(userId: string, config: CashFlowPredictionConfig) {
    // Get historical transaction data
    const timeframe = config.timeframeInDays > 180 ? 'year' : 'month';
    const data = await transactionDataService.prepareDataForPrediction(timeframe);
    
    // Get recurring transactions
    const recurringTransactions = await transactionDataService.getRecurringTransactions();
    
    // Combine income and expenses
    const allRecurringTransactions = [
      ...recurringTransactions.income.map(tx => ({ ...tx, category: 'Income' })),
      ...recurringTransactions.expenses.map(tx => {
        // Categorize expenses if category is missing
        if (!tx.category || tx.category === 'Uncategorized') {
          const matchingTransaction = tx.transactions[0];
          if (matchingTransaction) {
            tx.category = transactionCategorizationService.categorizeTransaction(matchingTransaction);
          }
        }
        return tx;
      }),
    ];
    
    return {
      transactions: data.allTransactions,
      recurringTransactions: allRecurringTransactions,
      accountBalances: [], // To be implemented
    };
  }
  
  /**
   * Aggregate daily predictions to weekly
   */
  private aggregateToWeekly(dailyPredictions: any[]): any[] {
    const weeks: any[] = [];
    let currentWeek = {
      startDate: dailyPredictions[0]?.date.toISOString().substring(0, 10) || '',
      endDate: '',
      cashFlow: 0,
      confidenceLow: 0,
      confidenceHigh: 0,
      dailyValues: [] as number[],
      dailyLows: [] as number[],
      dailyHighs: [] as number[],
    };
    
    let dayInWeek = 0;
    
    dailyPredictions.forEach((day, index) => {
      // Add to current week
      currentWeek.dailyValues.push(day.value);
      currentWeek.dailyLows.push(day.confidenceLow);
      currentWeek.dailyHighs.push(day.confidenceHigh);
      currentWeek.cashFlow += day.value;
      dayInWeek++;
      
      // End of week or last day
      if (dayInWeek === 7 || index === dailyPredictions.length - 1) {
        currentWeek.endDate = day.date.toISOString().substring(0, 10);
        
        // Calculate confidence intervals for the week
        currentWeek.confidenceLow = currentWeek.dailyValues.reduce(
          (sum, _, i) => sum + currentWeek.dailyLows[i],
          0
        );
        
        currentWeek.confidenceHigh = currentWeek.dailyValues.reduce(
          (sum, _, i) => sum + currentWeek.dailyHighs[i],
          0
        );
        
        weeks.push({
          startDate: currentWeek.startDate,
          endDate: currentWeek.endDate,
          cashFlow: currentWeek.cashFlow,
          confidenceLow: currentWeek.confidenceLow,
          confidenceHigh: currentWeek.confidenceHigh,
        });
        
        // Start a new week
        if (index < dailyPredictions.length - 1) {
          const nextDate = new Date(day.date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          currentWeek = {
            startDate: nextDate.toISOString().substring(0, 10),
            endDate: '',
            cashFlow: 0,
            confidenceLow: 0,
            confidenceHigh: 0,
            dailyValues: [],
            dailyLows: [],
            dailyHighs: [],
          };
          dayInWeek = 0;
        }
      }
    });
    
    return weeks;
  }
  
  /**
   * Aggregate daily predictions to monthly
   */
  private aggregateToMonthly(dailyPredictions: any[]): any[] {
    const months: Record<string, {
      month: string;
      cashFlow: number;
      confidenceLow: number;
      confidenceHigh: number;
      dailyValues: number[];
      dailyLows: number[];
      dailyHighs: number[];
    }> = {};
    
    dailyPredictions.forEach(day => {
      const monthKey = day.date.toISOString().substring(0, 7); // YYYY-MM
      const monthName = new Date(day.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          cashFlow: 0,
          confidenceLow: 0,
          confidenceHigh: 0,
          dailyValues: [],
          dailyLows: [],
          dailyHighs: [],
        };
      }
      
      months[monthKey].dailyValues.push(day.value);
      months[monthKey].dailyLows.push(day.confidenceLow);
      months[monthKey].dailyHighs.push(day.confidenceHigh);
      months[monthKey].cashFlow += day.value;
    });
    
    // Calculate confidence intervals for each month
    Object.values(months).forEach(month => {
      month.confidenceLow = month.dailyValues.reduce(
        (sum, _, i) => sum + month.dailyLows[i],
        0
      );
      
      month.confidenceHigh = month.dailyValues.reduce(
        (sum, _, i) => sum + month.dailyHighs[i],
        0
      );
    });
    
    return Object.values(months).map(month => ({
      month: month.month,
      cashFlow: month.cashFlow,
      confidenceLow: month.confidenceLow,
      confidenceHigh: month.confidenceHigh,
    }));
  }
  
  /**
   * Calculate total prediction for the entire period
   */
  private calculateTotal(dailyPredictions: any[]): any {
    const totalCashFlow = dailyPredictions.reduce(
      (sum, day) => sum + day.value,
      0
    );
    
    const totalLow = dailyPredictions.reduce(
      (sum, day) => sum + day.confidenceLow,
      0
    );
    
    const totalHigh = dailyPredictions.reduce(
      (sum, day) => sum + day.confidenceHigh,
      0
    );
    
    return {
      cashFlow: totalCashFlow,
      confidenceLow: totalLow,
      confidenceHigh: totalHigh,
    };
  }
  
  /**
   * Format daily predictions for the API response
   */
  private formatDailyPredictions(dailyPredictions: any[]): any[] {
    return dailyPredictions.map(day => ({
      date: day.date.toISOString().substring(0, 10),
      cashFlow: day.value,
      confidenceLow: day.confidenceLow,
      confidenceHigh: day.confidenceHigh,
      recurringTransactions: day.recurringTransactions.map((tx: any) => ({
        merchantName: tx.merchantName,
        amount: tx.amount,
        category: tx.category,
        isIncome: tx.isIncome,
      })),
    }));
  }
  
  /**
   * Generate alerts based on predictions
   */
  private generateAlerts(dailyPredictions: any[], predictionData: any): any[] {
    const alerts: any[] = [];
    let runningBalance = predictionData.accountBalances.reduce(
      (sum: number, account: any) => sum + account.balance,
      0
    );
    
    // Sort predictions by date
    const sortedPredictions = [...dailyPredictions].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    // Generate alerts for each day
    sortedPredictions.forEach(day => {
      // Update running balance
      runningBalance += day.value;
      
      // Check for negative balance
      if (runningBalance < 0) {
        alerts.push({
          date: day.date.toISOString().substring(0, 10),
          type: 'negative-balance',
          message: `Projected negative balance of $${Math.abs(runningBalance).toFixed(2)}`,
          severity: runningBalance < -500 ? 'high' : runningBalance < -100 ? 'medium' : 'low',
        });
      }
      
      // Check for large expenses
      const largeExpenses = day.recurringTransactions.filter(
        (tx: any) => tx.amount < -200 && !tx.isIncome
      );
      
      if (largeExpenses.length > 0) {
        alerts.push({
          date: day.date.toISOString().substring(0, 10),
          type: 'large-expense',
          message: `${largeExpenses.length} large expense(s) totaling $${Math.abs(
            largeExpenses.reduce((sum: number, tx: any) => sum + tx.amount, 0)
          ).toFixed(2)}`,
          severity: 'medium',
          relatedTransactions: largeExpenses,
        });
      }
      
      // Check for unusual activity (large deviations from confidence intervals)
      if (Math.abs(day.value) > 0 && (
          day.value < day.confidenceLow * 0.5 || 
          day.value > day.confidenceHigh * 1.5
      )) {
        alerts.push({
          date: day.date.toISOString().substring(0, 10),
          type: 'unusual-activity',
          message: 'Unusual cash flow activity predicted',
          severity: 'low',
        });
      }
    });
    
    return alerts;
  }
}

export const cashFlowPredictionService = new CashFlowPredictionService();
```

#### 1.3.2 Cash Flow API Controller
```typescript
// src/controllers/CashFlowPredictionController.ts
import { Request, Response, NextFunction } from 'express';
import { cashFlowPredictionService } from '../services/cashFlowPredictionService';
import { ApiError } from '../utils/ApiError';
import { validate } from '../middleware/validation';
import { z } from 'zod';

// Validation schema
const generatePredictionsSchema = z.object({
  query: z.object({
    timeframeInDays: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    modelType: z.enum(['time-series', 'recurring-transaction', 'hybrid']).optional(),
    includePendingTransactions: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    includeRecurringTransactions: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    confidenceLevel: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  }),
});

export class CashFlowPredictionController {
  /**
   * Generate cash flow predictions
   */
  public static generatePredictions = [
    validate(generatePredictionsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const config = req.query;
        
        const predictions = await cashFlowPredictionService.generatePredictions(
          userId,
          {
            timeframeInDays: config.timeframeInDays as number,
            modelType: config.modelType as any,
            includePendingTransactions: config.includePendingTransactions as boolean,
            includeRecurringTransactions: config.includeRecurringTransactions as boolean,
            confidenceLevel: config.confidenceLevel as number,
          }
        );
        
        res.json(predictions);
      } catch (error) {
        next(error);
      }
    },
  ];
  
  /**
   * Get recurring transactions
   */
  public static getRecurringTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      
      const recurringTransactions = await transactionDataService.getRecurringTransactions();
      
      res.json(recurringTransactions);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get model validation metrics
   */
  public static getModelValidation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { modelType } = req.query;
      
      // This would validate the model against historical data to show accuracy metrics
      // Implementation would depend on the modeling approach
      
      // For now, return a placeholder
      res.json({
        modelType: modelType || 'hybrid',
        metrics: {
          accuracy: 0.85,
          meanAbsoluteError: 42.5,
          meanSquaredError: 2345.6,
          rootMeanSquaredError: 48.4,
        },
        validationPeriod: {
          startDate: '2023-01-01',
          endDate: '2023-03-31',
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### 1.4 User Interface Implementation

#### 1.4.1 Cash Flow Chart Component
```typescript
// src/components/features/cashFlow/CashFlowChart.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '../../common/Card';
import { Select } from '../../common/Select';
import { Toggle } from '../../common/Toggle';
import { dateUtils } from '../../../utils/dateUtils';

interface CashFlowChartProps {
  predictions: any;
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
  isLoading: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  predictions,
  timeframe,
  onTimeframeChange,
  isLoading,
}) => {
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Process data based on selected timeframe
  useEffect(() => {
    if (!predictions) return;
    
    let data;
    switch (timeframe) {
      case 'daily':
        data = predictions.dailyPredictions?.map((day: any) => ({
          date: day.date,
          cashFlow: day.cashFlow,
          confidenceLow: day.confidenceLow,
          confidenceHigh: day.confidenceHigh,
          // Format date for tooltip display
          displayDate: dateUtils.formatDate(new Date(day.date), 'MMM d, yyyy'),
        }));
        break;
        
      case 'weekly':
        data = predictions.weeklyPredictions?.map((week: any) => ({
          date: week.startDate,
          cashFlow: week.cashFlow,
          confidenceLow: week.confidenceLow,
          confidenceHigh: week.confidenceHigh,
          // Format date range for tooltip display
          displayDate: `${dateUtils.formatDate(new Date(week.startDate), 'MMM d')} - ${dateUtils.formatDate(new Date(week.endDate), 'MMM d, yyyy')}`,
        }));
        break;
        
      case 'monthly':
        data = predictions.monthlyPredictions?.map((month: any) => ({
          date: month.month,
          cashFlow: month.cashFlow,
          confidenceLow: month.confidenceLow,
          confidenceHigh: month.confidenceHigh,
          displayDate: month.month,
        }));
        break;
        
      default:
        data = [];
    }
    
    setChartData(data || []);
  }, [predictions, timeframe]);
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-semibold">{data.displayDate}</p>
          <p className={`text-lg ${data.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.cashFlow >= 0 ? 'Net Income: ' : 'Net Expense: '}
            {formatCurrency(data.cashFlow)}
          </p>
          {showConfidenceInterval && (
            <div className="text-sm text-gray-600 mt-2">
              <p>Confidence Range:</p>
              <p>{formatCurrency(data.confidenceLow)} - {formatCurrency(data.confidenceHigh)}</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="w-full h-96">
      <Card.Header>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cash Flow Projection</h3>
          <div className="flex space-x-4 items-center">
            <Select
              value={timeframe}
              onChange={e => onTimeframeChange(e.target.value as any)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              className="w-32"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Confidence Interval</span>
              <Toggle
                checked={showConfidenceInterval}
                onChange={setShowConfidenceInterval}
              />
            </div>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {showConfidenceInterval ? (
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    if (timeframe === 'monthly') return value.substring(0, 3);
                    return dateUtils.formatDate(new Date(value), 'MMM d');
                  }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (Math.abs(value) / 1000).toFixed(1) + 'k' : Math.abs(value)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confidenceLow" 
                  stackId="1"
                  stroke="transparent" 
                  fill="rgba(200, 230, 255, 0.8)" 
                  name="Confidence Range" 
                />
                <Area 
                  type="monotone" 
                  dataKey="confidenceHigh" 
                  stackId="1"
                  stroke="transparent" 
                  fill="rgba(200, 230, 255, 0.4)" 
                  name="Confidence Range" 
                />
                <Line 
                  type="monotone" 
                  dataKey="cashFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Projected Cash Flow"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    if (timeframe === 'monthly') return value.substring(0, 3);
                    return dateUtils.formatDate(new Date(value), 'MMM d');
                  }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (Math.abs(value) / 1000).toFixed(1) + 'k' : Math.abs(value)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cashFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Projected Cash Flow"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No prediction data available
          </div>
        )}
      </Card.Body>        
```jsx
    </Card>
  );
};
```

#### 1.4.2 Cash Flow Alerts Component
```typescript
// src/components/features/cashFlow/CashFlowAlerts.tsx
import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { dateUtils } from '../../../utils/dateUtils';

interface CashFlowAlertsProps {
  alerts: Array<{
    date: string;
    type: 'negative-balance' | 'large-expense' | 'unusual-activity';
    message: string;
    severity: 'low' | 'medium' | 'high';
    relatedTransactions?: any[];
  }>;
  isLoading: boolean;
}

export const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({
  alerts,
  isLoading,
}) => {
  // Get alert icon and color based on type and severity
  const getAlertStyles = (
    type: 'negative-balance' | 'large-expense' | 'unusual-activity',
    severity: 'low' | 'medium' | 'high'
  ) => {
    const severityColors = {
      low: 'text-blue-500 bg-blue-100',
      medium: 'text-orange-500 bg-orange-100',
      high: 'text-red-500 bg-red-100',
    };
    
    const typeIcons = {
      'negative-balance': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      'large-expense': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'unusual-activity': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    };
    
    return {
      colorClass: severityColors[severity],
      icon: typeIcons[type],
    };
  };
  
  return (
    <Card className="w-full">
      <Card.Header>
        <h3 className="text-lg font-semibold">Cash Flow Alerts</h3>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const { colorClass, icon } = getAlertStyles(alert.type, alert.severity);
              
              return (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 flex items-start"
                >
                  <div className={`rounded-full p-2 ${colorClass} mr-4 flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {alert.type === 'negative-balance' ? 'Negative Balance Alert' :
                           alert.type === 'large-expense' ? 'Large Expense Alert' : 
                           'Unusual Activity Alert'}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {dateUtils.formatDate(new Date(alert.date), 'MMMM d, yyyy')}
                        </div>
                      </div>
                      <Badge
                        variant={
                          alert.severity === 'high' ? 'error' :
                          alert.severity === 'medium' ? 'warning' : 'info'
                        }
                      >
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </div>
                    <p>{alert.message}</p>
                    
                    {alert.relatedTransactions && alert.relatedTransactions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">Related Transactions:</div>
                        <div className="space-y-1">
                          {alert.relatedTransactions.map((tx, idx) => (
                            <div key={idx} className="text-sm flex justify-between">
                              <span>{tx.merchantName}</span>
                              <span className="font-medium">
                                {tx.isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-500">
            No alerts found
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
```

#### 1.4.3 Cash Flow Prediction Page
```typescript
// src/pages/CashFlowPredictionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { cashFlowPredictionService } from '../services/cashFlowPredictionService';
import { CashFlowChart } from '../components/features/cashFlow/CashFlowChart';
import { CashFlowAlerts } from '../components/features/cashFlow/CashFlowAlerts';
import { RecurringTransactionsList } from '../components/features/cashFlow/RecurringTransactionsList';
import { CashFlowSummary } from '../components/features/cashFlow/CashFlowSummary';
import { Card } from '../components/common/Card';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';

const CashFlowPredictionPage: React.FC = () => {
  // State
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [predictionConfig, setPredictionConfig] = useState({
    timeframeInDays: 90,
    modelType: 'hybrid' as 'time-series' | 'recurring-transaction' | 'hybrid',
    includePendingTransactions: true,
    includeRecurringTransactions: true,
    confidenceLevel: 0.95,
  });
  
  // Load predictions
  const {
    execute: loadPredictions,
    data: predictions,
    loading: isLoading,
    error,
  } = useAsyncAction(cashFlowPredictionService.generatePredictions);
  
  // Load predictions on mount and when config changes
  useEffect(() => {
    loadPredictions(predictionConfig);
  }, [predictionConfig, loadPredictions]);
  
  // Handle config changes
  const handleConfigChange = (key: keyof typeof predictionConfig, value: any) => {
    setPredictionConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cash Flow Prediction</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Prediction Settings</h3>
              <Button
                variant="primary"
                onClick={() => loadPredictions(predictionConfig)}
                loading={isLoading}
              >
                Refresh Predictions
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prediction Timeframe
                </label>
                <Select
                  value={predictionConfig.timeframeInDays.toString()}
                  onChange={e => handleConfigChange('timeframeInDays', parseInt(e.target.value))}
                  options={[
                    { value: '30', label: '30 Days' },
                    { value: '90', label: '90 Days' },
                    { value: '180', label: '6 Months' },
                    { value: '365', label: '1 Year' },
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prediction Model
                </label>
                <Select
                  value={predictionConfig.modelType}
                  onChange={e => handleConfigChange('modelType', e.target.value)}
                  options={[
                    { value: 'hybrid', label: 'Hybrid Model' },
                    { value: 'time-series', label: 'Time Series' },
                    { value: 'recurring-transaction', label: 'Recurring Transactions' },
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Level
                </label>
                <Select
                  value={predictionConfig.confidenceLevel.toString()}
                  onChange={e => handleConfigChange('confidenceLevel', parseFloat(e.target.value))}
                  options={[
                    { value: '0.8', label: '80%' },
                    { value: '0.9', label: '90%' },
                    { value: '0.95', label: '95%' },
                    { value: '0.99', label: '99%' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-8">
              <div className="flex items-center">
                <Toggle
                  checked={predictionConfig.includePendingTransactions}
                  onChange={value => handleConfigChange('includePendingTransactions', value)}
                  label="Include Pending Transactions"
                />
              </div>
              
              <div className="flex items-center">
                <Toggle
                  checked={predictionConfig.includeRecurringTransactions}
                  onChange={value => handleConfigChange('includeRecurringTransactions', value)}
                  label="Include Recurring Transactions"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <CashFlowSummary
          prediction={predictions?.totalPrediction}
          isLoading={isLoading}
        />
      </div>
      
      <div className="mb-6">
        <CashFlowChart
          predictions={predictions}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowAlerts
          alerts={predictions?.alerts || []}
          isLoading={isLoading}
        />
        
        <RecurringTransactionsList
          income={predictions?.recurringTransactions?.income || []}
          expenses={predictions?.recurringTransactions?.expenses || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CashFlowPredictionPage;
```

## 2. Investment Portfolio Analysis Implementation

### 2.1 Account Integration

#### 2.1.1 Investment Account Model and Repository
```typescript
// src/models/InvestmentAccount.ts
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
  last_updated: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
}

// server/repositories/InvestmentAccountRepository.ts
import { db } from '../config/database';
import { InvestmentAccount, InvestmentHolding, Security, InvestmentTransaction } from '../models/InvestmentAccount';
import { BaseRepository } from '../utils/BaseRepository';

class InvestmentAccountRepository extends BaseRepository<InvestmentAccount> {
  constructor() {
    super('investment_accounts');
  }
  
  /**
   * Find all investment accounts for a user
   */
  async findByUserId(userId: string): Promise<InvestmentAccount[]> {
    const query = `
      SELECT *
      FROM ${this.tableName}
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY name
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows as InvestmentAccount[];
  }
  
  /**
   * Find investment account by ID
   */
  async findById(id: string, userId: string): Promise<InvestmentAccount | null> {
    const query = `
      SELECT *
      FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as InvestmentAccount;
  }
  
  /**
   * Get all holdings for an investment account
   */
  async getHoldings(accountId: string, userId: string): Promise<Array<InvestmentHolding & { security: Security }>> {
    // First verify the account belongs to the user
    const accountQuery = `
      SELECT id FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const accountResult = await db.query(accountQuery, [accountId, userId]);
    
    if (accountResult.rows.length === 0) {
      throw new Error('Investment account not found or access denied');
    }
    
    // Get holdings with securities
    const query = `
      SELECT h.*, s.*
      FROM investment_holdings h
      JOIN securities s ON h.security_id = s.id
      WHERE h.investment_account_id = $1
      ORDER BY s.name
    `;
    
    const result = await db.query(query, [accountId]);
    
    return result.rows.map(row => {
      const holding = {
        id: row.id,
        investment_account_id: row.investment_account_id,
        security_id: row.security_id,
        cost_basis: row.cost_basis,
        quantity: row.quantity,
        value: row.value,
        institution_value: row.institution_value,
        institution_price: row.institution_price,
        institution_price_as_of: row.institution_price_as_of,
        is_manual: row.is_manual,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as InvestmentHolding;
      
      const security = {
        id: row.security_id,
        ticker_symbol: row.ticker_symbol,
        name: row.name,
        type: row.type,
        close_price: row.close_price,
        close_price_as_of: row.close_price_as_of,
        isin: row.isin,
        cusip: row.cusip,
        currency_code: row.currency_code,
        is_cash_equivalent: row.is_cash_equivalent,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as Security;
      
      return {
        ...holding,
        security,
      };
    });
  }
  
  /**
   * Get transactions for an investment account
   */
  async getTransactions(
    accountId: string,
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<InvestmentTransaction & { security?: Security }>> {
    // First verify the account belongs to the user
    const accountQuery = `
      SELECT id FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const accountResult = await db.query(accountQuery, [accountId, userId]);
    
    if (accountResult.rows.length === 0) {
      throw new Error('Investment account not found or access denied');
    }
    
    // Get transactions with securities
    const query = `
      SELECT t.*, s.*
      FROM investment_transactions t
      LEFT JOIN securities s ON t.security_id = s.id
      WHERE t.investment_account_id = $1
      AND t.date BETWEEN $3 AND $4
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [accountId, startDate, endDate]);
    
    return result.rows.map(row => {
      const transaction = {
        id: row.id,
        investment_account_id: row.investment_account_id,
        security_id: row.security_id,
        transaction_type: row.transaction_type,
        amount: row.amount,
        quantity: row.quantity,
        price: row.price,
        fees: row.fees,
        date: row.date,
        name: row.name,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as InvestmentTransaction;
      
      let security: Security | undefined;
      
      if (row.security_id) {
        security = {
          id: row.security_id,
          ticker_symbol: row.ticker_symbol,
          name: row.name,
          type: row.type,
          close_price: row.close_price,
          close_price_as_of: row.close_price_as_of,
          isin: row.isin,
          cusip: row.cusip,
          currency_code: row.currency_code,
          is_cash_equivalent: row.is_cash_equivalent,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }
      
      return {
        ...transaction,
        security,
      };
    });
  }
  
  /**
   * Create a manual investment account
   */
  async createManualAccount(account: Partial<InvestmentAccount>, userId: string): Promise<InvestmentAccount> {
    const query = `
      INSERT INTO ${this.tableName} (
        user_id, name, type, subtype, institution_name, 
        balance, currency_code, is_manual, is_hidden, is_closed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      userId,
      account.name,
      account.type,
      account.subtype,
      account.institution_name,
      account.balance || 0,
      account.currency_code || 'USD',
      true, // is_manual
      account.is_hidden || false,
      account.is_closed || false,
    ];
    
    const result = await db.query(query, values);
    return result.rows[0] as InvestmentAccount;
  }
  
  /**
   * Add a holding to an investment account
   */
  async addHolding(
    accountId: string,
    userId: string,
    holding: Partial<InvestmentHolding>,
    security: Partial<Security>
  ): Promise<InvestmentHolding & { security: Security }> {
    // First verify the account belongs to the user
    const accountQuery = `
      SELECT id FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    
    const accountResult = await db.query(accountQuery, [accountId, userId]);
    
    if (accountResult.rows.length === 0) {
      throw new Error('Investment account not found or access denied');
    }
    
    // Start a transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if the security already exists
      let securityId: string;
      
      if (security.ticker_symbol) {
        // Try to find by ticker
        const existingSecurityQuery = `
          SELECT id FROM securities
          WHERE ticker_symbol = $1
        `;
        
        const existingSecurityResult = await client.query(existingSecurityQuery, [security.ticker_symbol]);
        
        if (existingSecurityResult.rows.length > 0) {
          securityId = existingSecurityResult.rows[0].id;
        } else {
          // Create new security
          const newSecurityQuery = `
            INSERT INTO securities (
              ticker_symbol, name, type, currency_code, is_cash_equivalent
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `;
          
          const newSecurityResult = await client.query(newSecurityQuery, [
            security.ticker_symbol,
            security.name,
            security.type || 'equity',
            security.currency_code || 'USD',
            security.is_cash_equivalent || false,
          ]);
          
          securityId = newSecurityResult.rows[0].id;
        }
      } else {
        // Create new security without ticker
        const newSecurityQuery = `
          INSERT INTO securities (
            name, type, currency_code, is_cash_equivalent
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        
        const newSecurityResult = await client.query(newSecurityQuery, [
          security.name,
          security.type || 'other',
          security.currency_code || 'USD',
          security.is_cash_equivalent || false,
        ]);
        
        securityId = newSecurityResult.rows[0].id;
      }
      
      // Create holding
      const holdingQuery = `
        INSERT INTO investment_holdings (
          investment_account_id, security_id, cost_basis, 
          quantity, value, is_manual
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const holdingResult = await client.query(holdingQuery, [
        accountId,
        securityId,
        holding.cost_basis,
        holding.quantity,
        holding.value,
        true, // is_manual
      ]);
      
      // Get the full security
      const securityQuery = `
        SELECT * FROM securities WHERE id = $1
      `;
      
      const securityResult = await client.query(securityQuery, [securityId]);
      
      // Update account balance
      const updateBalanceQuery = `
        UPDATE ${this.tableName}
        SET balance = balance + $1,
            updated_at = NOW()
        WHERE id = $2
      `;
      
      await client.query(updateBalanceQuery, [holding.value, accountId]);
      
      await client.query('COMMIT');
      
      return {
        ...holdingResult.rows[0],
        security: securityResult.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const investmentAccountRepository = new InvestmentAccountRepository();
```

#### 2.1.2 Enhanced Plaid Investment Account Integration
```typescript
// src/services/plaidInvestmentService.ts
import { api } from './api';
import { retry } from '../utils/retry';

class PlaidInvestmentService {
  /**
   * Create a link token specifically for investments
   */
  async createLinkToken(): Promise<string> {
    try {
      const response = await api.post<{ link_token: string }>('/plaid/create-link-token', {
        products: ['investments'],
      });
      
      return response.link_token;
    } catch (error) {
      console.error('Error creating Plaid investment link token:', error);
      throw error;
    }
  }
  
  /**
   * Get investment holdings for all connected accounts
   */
  async getInvestmentHoldings(): Promise<any> {
    try {
      const response = await retry(() => 
        api.get('/plaid/investments/holdings')
      );
      
      return response;
    } catch (error) {
      console.error('Error getting investment holdings:', error);
      throw error;
    }
  }
  
  /**
   * Get investment transactions for a date range
   */
  async getInvestmentTransactions(
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const response = await retry(() =>
        api.get('/plaid/investments/transactions', {
          params: { start_date: startDate, end_date: endDate }
        })
      );
      
      return response;
    } catch (error) {
      console.error('Error getting investment transactions:', error);
      throw error;
    }
  }
  
  /**
   * Sync investment accounts manually
   */
  async syncInvestmentAccounts(): Promise<any> {
    try {
      const response = await api.post('/plaid/investments/sync');
      return response;
    } catch (error) {
      console.error('Error syncing investment accounts:', error);
      throw error;
    }
  }
}

export const plaidInvestmentService = new PlaidInvestmentService();

// server/controllers/PlaidInvestmentController.js
import { Request, Response, NextFunction } from 'express';
import { plaidClient } from '../services/plaidClient';
import { investmentAccountRepository } from '../repositories/InvestmentAccountRepository';
import { ApiError } from '../utils/ApiError';

export class PlaidInvestmentController {
  /**
   * Get investment holdings from Plaid
   */
  static getInvestmentHoldings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      // Get all Plaid items for the user
      const items = await db.query(
        'SELECT * FROM plaid_items WHERE user_id = $1',
        [userId]
      );
      
      const holdingsResponse = [];
      
      // For each item, get investment holdings
      for (const item of items.rows) {
        try {
          // Decrypt access token
          const accessToken = decrypt(item.plaid_access_token);
          
          // Get holdings from Plaid
          const plaidResponse = await plaidClient.investmentsHoldingsGet({
            access_token: accessToken,
          });
          
          // Process and store the holdings
          await this.processAndStoreHoldings(plaidResponse, userId, item.id);
          
          holdingsResponse.push({
            institution_id: item.institution_id,
            institution_name: item.institution_name,
            accounts: plaidResponse.accounts,
            holdings: plaidResponse.holdings,
            securities: plaidResponse.securities,
          });
        } catch (error) {
          console.error(`Error fetching holdings for item ${item.id}:`, error);
          // Continue with next item even if one fails
        }
      }
      
      res.json({ holdings: holdingsResponse });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get investment transactions from Plaid
   */
  static getInvestmentTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;
```javascript
      if (!start_date || !end_date) {
        throw new ApiError(400, 'start_date and end_date are required');
      }
      
      // Get all Plaid items for the user
      const items = await db.query(
        'SELECT * FROM plaid_items WHERE user_id = $1',
        [userId]
      );
      
      const transactionsResponse = [];
      
      // For each item, get investment transactions
      for (const item of items.rows) {
        try {
          // Decrypt access token
          const accessToken = decrypt(item.plaid_access_token);
          
          // Get transactions from Plaid
          const plaidResponse = await plaidClient.investmentsTransactionsGet({
            access_token: accessToken,
            start_date: start_date as string,
            end_date: end_date as string,
          });
          
          // Process and store the transactions
          await this.processAndStoreTransactions(plaidResponse, userId, item.id);
          
          transactionsResponse.push({
            institution_id: item.institution_id,
            institution_name: item.institution_name,
            accounts: plaidResponse.accounts,
            investment_transactions: plaidResponse.investment_transactions,
            securities: plaidResponse.securities,
          });
        } catch (error) {
          console.error(`Error fetching transactions for item ${item.id}:`, error);
          // Continue with next item even if one fails
        }
      }
      
      res.json({ transactions: transactionsResponse });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Process and store investment holdings
   */
  private static async processAndStoreHoldings(plaidResponse: any, userId: string, itemId: string) {
    // Start a database transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Store securities first
      for (const security of plaidResponse.securities) {
        // Check if security already exists
        const securityResult = await client.query(
          'SELECT id FROM securities WHERE cusip = $1 OR (ticker_symbol = $2 AND ticker_symbol IS NOT NULL)',
          [security.cusip, security.ticker_symbol]
        );
        
        let securityId;
        
        if (securityResult.rows.length > 0) {
          // Update existing security
          securityId = securityResult.rows[0].id;
          
          await client.query(
            `UPDATE securities 
             SET name = $1, 
                 ticker_symbol = $2, 
                 cusip = $3,
                 isin = $4,
                 type = $5,
                 close_price = $6,
                 close_price_as_of = $7,
                 is_cash_equivalent = $8,
                 currency_code = $9,
                 updated_at = NOW()
             WHERE id = $10`,
            [
              security.name,
              security.ticker_symbol,
              security.cusip,
              security.isin,
              security.type,
              security.close_price,
              security.close_price_as_of,
              security.is_cash_equivalent,
              security.iso_currency_code || 'USD',
              securityId,
            ]
          );
        } else {
          // Insert new security
          const newSecurityResult = await client.query(
            `INSERT INTO securities (
               name, ticker_symbol, cusip, isin, type, close_price, 
               close_price_as_of, is_cash_equivalent, currency_code
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
              security.name,
              security.ticker_symbol,
              security.cusip,
              security.isin,
              security.type,
              security.close_price,
              security.close_price_as_of,
              security.is_cash_equivalent,
              security.iso_currency_code || 'USD',
            ]
          );
          
          securityId = newSecurityResult.rows[0].id;
        }
        
        // Map Plaid security ID to our security ID
        security.db_id = securityId;
      }
      
      // Process accounts
      for (const account of plaidResponse.accounts) {
        // Check if account already exists
        const accountResult = await client.query(
          'SELECT id FROM investment_accounts WHERE plaid_account_id = $1',
          [account.account_id]
        );
        
        let accountId;
        
        if (accountResult.rows.length > 0) {
          // Update existing account
          accountId = accountResult.rows[0].id;
          
          await client.query(
            `UPDATE investment_accounts 
             SET name = $1, 
                 type = $2,
                 subtype = $3,
                 balance = $4,
                 available_balance = $5,
                 currency_code = $6,
                 updated_at = NOW()
             WHERE id = $7`,
            [
              account.name,
              account.type,
              account.subtype,
              account.balances.current,
              account.balances.available,
              account.balances.iso_currency_code || 'USD',
              accountId,
            ]
          );
        } else {
          // Insert new account
          const newAccountResult = await client.query(
            `INSERT INTO investment_accounts (
               user_id, plaid_item_id, plaid_account_id, name, type, subtype,
               institution_name, balance, available_balance, currency_code,
               is_manual, is_hidden, is_closed
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING id`,
            [
              userId,
              itemId,
              account.account_id,
              account.name,
              account.type,
              account.subtype,
              plaidResponse.institution?.name || '',
              account.balances.current,
              account.balances.available,
              account.balances.iso_currency_code || 'USD',
              false, // is_manual
              false, // is_hidden
              false, // is_closed
            ]
          );
          
          accountId = newAccountResult.rows[0].id;
        }
        
        // Store the database ID in the account object for reference
        account.db_id = accountId;
      }
      
      // Store holdings
      for (const holding of plaidResponse.holdings) {
        const accountId = plaidResponse.accounts.find(
          (a: any) => a.account_id === holding.account_id
        ).db_id;
        
        const securityId = plaidResponse.securities.find(
          (s: any) => s.security_id === holding.security_id
        ).db_id;
        
        // Check if holding already exists
        const holdingResult = await client.query(
          `SELECT id FROM investment_holdings 
           WHERE investment_account_id = $1 AND security_id = $2`,
          [accountId, securityId]
        );
        
        if (holdingResult.rows.length > 0) {
          // Update existing holding
          await client.query(
            `UPDATE investment_holdings 
             SET quantity = $1, 
                 cost_basis = $2,
                 value = $3,
                 institution_value = $4,
                 institution_price = $5,
                 institution_price_as_of = $6,
                 updated_at = NOW()
             WHERE id = $7`,
            [
              holding.quantity,
              holding.cost_basis,
              holding.institution_value,
              holding.institution_value,
              holding.institution_price,
              holding.institution_price_as_of,
              holdingResult.rows[0].id,
            ]
          );
        } else {
          // Insert new holding
          await client.query(
            `INSERT INTO investment_holdings (
               investment_account_id, security_id, quantity, cost_basis,
               value, institution_value, institution_price, institution_price_as_of,
               is_manual
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              accountId,
              securityId,
              holding.quantity,
              holding.cost_basis,
              holding.institution_value,
              holding.institution_value,
              holding.institution_price,
              holding.institution_price_as_of,
              false, // is_manual
            ]
          );
        }
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Process and store investment transactions
   */
  private static async processAndStoreTransactions(plaidResponse: any, userId: string, itemId: string) {
    // Implementation similar to processAndStoreHoldings
    // This would handle storing investment transactions in the database
  }
}
```

### 2.2 Portfolio Analysis Service

```typescript
// src/services/portfolioAnalysisService.ts
import { dateUtils } from '../utils/dateUtils';

interface SecurityAllocation {
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

interface AssetClassAllocation {
  assetClass: string;
  value: number;
  percentage: number;
  securities: SecurityAllocation[];
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  securities: SecurityAllocation[];
}

interface PortfolioAnalysis {
  totalValue: number;
  cashValue: number;
  investedValue: number;
  totalGain: number;
  totalGainPercentage: number;
  assetAllocation: AssetClassAllocation[];
  sectorAllocation: SectorAllocation[];
  securities: SecurityAllocation[];
  riskMetrics: {
    sharpeRatio?: number;
    beta?: number;
    alpha?: number;
    standardDeviation?: number;
    maxDrawdown?: number;
  };
  performanceMetrics: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    ytd?: number;
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
    tenYear?: number;
    sinceInception?: number;
  };
}

class PortfolioAnalysisService {
  /**
   * Get portfolio analysis
   */
  async getPortfolioAnalysis(
    userId: string,
    accountIds?: string[]
  ): Promise<PortfolioAnalysis> {
    // Get accounts and holdings from the database
    const accounts = await this.getInvestmentAccounts(userId, accountIds);
    const holdings = await this.getHoldings(userId, accountIds);
    
    // Calculate total portfolio value
    const totalValue = holdings.reduce((total, holding) => total + holding.value, 0);
    
    // Calculate investment gain
    const totalCostBasis = holdings.reduce((total, holding) => {
      return total + (holding.costBasis || holding.value);
    }, 0);
    
    const totalGain = totalValue - totalCostBasis;
    const totalGainPercentage = (totalGain / totalCostBasis) * 100;
    
    // Calculate cash value
    const cashValue = holdings
      .filter(h => h.security.is_cash_equivalent)
      .reduce((total, holding) => total + holding.value, 0);
    
    // Calculate invested value (non-cash)
    const investedValue = totalValue - cashValue;
    
    // Create security allocations
    const securities = this.createSecurityAllocations(holdings, totalValue);
    
    // Create asset class allocation
    const assetAllocation = this.createAssetClassAllocation(securities);
    
    // Create sector allocation
    const sectorAllocation = this.createSectorAllocation(securities);
    
    // Calculate risk metrics
    const riskMetrics = await this.calculateRiskMetrics(securities);
    
    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(
      userId,
      accountIds
    );
    
    return {
      totalValue,
      cashValue,
      investedValue,
      totalGain,
      totalGainPercentage,
      assetAllocation,
      sectorAllocation,
      securities,
      riskMetrics,
      performanceMetrics,
    };
  }
  
  /**
   * Get investment accounts for a user
   */
  private async getInvestmentAccounts(userId: string, accountIds?: string[]) {
    try {
      let query = `
        SELECT * FROM investment_accounts
        WHERE user_id = $1 AND deleted_at IS NULL AND is_closed = false
      `;
      
      const queryParams = [userId];
      
      if (accountIds && accountIds.length > 0) {
        query += ` AND id IN (${accountIds.map((_, i) => `$${i + 2}`).join(',')})`;
        queryParams.push(...accountIds);
      }
      
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error getting investment accounts:', error);
      throw error;
    }
  }
  
  /**
   * Get holdings for accounts
   */
  private async getHoldings(userId: string, accountIds?: string[]) {
    try {
      let query = `
        SELECT h.*, s.*, a.user_id
        FROM investment_holdings h
        JOIN investment_accounts a ON h.investment_account_id = a.id
        JOIN securities s ON h.security_id = s.id
        WHERE a.user_id = $1 AND a.deleted_at IS NULL AND a.is_closed = false
      `;
      
      const queryParams = [userId];
      
      if (accountIds && accountIds.length > 0) {
        query += ` AND a.id IN (${accountIds.map((_, i) => `$${i + 2}`).join(',')})`;
        queryParams.push(...accountIds);
      }
      
      const result = await db.query(query, queryParams);
      
      // Transform results
      return result.rows.map(row => {
        return {
          id: row.id,
          accountId: row.investment_account_id,
          securityId: row.security_id,
          quantity: row.quantity,
          value: row.value || row.institution_value,
          costBasis: row.cost_basis,
          price: row.institution_price || (row.quantity ? row.value / row.quantity : 0),
          security: {
            id: row.security_id,
            name: row.name,
            ticker_symbol: row.ticker_symbol,
            type: row.type,
            close_price: row.close_price,
            is_cash_equivalent: row.is_cash_equivalent,
          },
        };
      });
    } catch (error) {
      console.error('Error getting holdings:', error);
      throw error;
    }
  }
  
  /**
   * Create security allocations
   */
  private createSecurityAllocations(
    holdings: any[],
    totalValue: number
  ): SecurityAllocation[] {
    return holdings.map(holding => {
      const gain = holding.costBasis 
        ? holding.value - holding.costBasis 
        : undefined;
      
      const gainPercentage = holding.costBasis && holding.costBasis > 0
        ? (gain! / holding.costBasis) * 100
        : undefined;
      
      return {
        securityId: holding.securityId,
        ticker: holding.security.ticker_symbol,
        name: holding.security.name,
        value: holding.value,
        percentage: (holding.value / totalValue) * 100,
        quantity: holding.quantity,
        price: holding.price,
        costBasis: holding.costBasis,
        gain,
        gainPercentage,
      };
    });
  }
  
  /**
   * Create asset class allocation
   */
  private createAssetClassAllocation(
    securities: SecurityAllocation[]
  ): AssetClassAllocation[] {
    const assetClasses: Record<string, {
      value: number;
      securities: SecurityAllocation[];
    }> = {};
    
    // Map security types to asset classes
    const assetClassMap: Record<string, string> = {
      'equity': 'Stocks',
      'fixed_income': 'Bonds',
      'cash': 'Cash',
      'derivative': 'Derivatives',
      'etf': 'ETFs',
      'mutual_fund': 'Mutual Funds',
      'other': 'Other',
    };
    
    securities.forEach(security => {
      // Get asset class from security type
      const securityType = this.getSecurityType(security);
      const assetClass = assetClassMap[securityType] || 'Other';
      
      if (!assetClasses[assetClass]) {
        assetClasses[assetClass] = {
          value: 0,
          securities: [],
        };
      }
      
      assetClasses[assetClass].value += security.value;
      assetClasses[assetClass].securities.push(security);
    });
    
    const totalValue = securities.reduce((sum, s) => sum + s.value, 0);
    
    return Object.entries(assetClasses).map(([assetClass, data]) => ({
      assetClass,
      value: data.value,
      percentage: (data.value / totalValue) * 100,
      securities: data.securities,
    }));
  }
  
  /**
   * Create sector allocation
   */
  private createSectorAllocation(
    securities: SecurityAllocation[]
  ): SectorAllocation[] {
    // In a real implementation, we would use a security data provider
    // to get sector information for each security
    
    // For now, we'll use a simplified approach with dummy data
    const sectors: Record<string, {
      value: number;
      securities: SecurityAllocation[];
    }> = {
      'Technology': { value: 0, securities: [] },
      'Financial': { value: 0, securities: [] },
      'Healthcare': { value: 0, securities: [] },
      'Consumer': { value: 0, securities: [] },
      'Industrial': { value: 0, securities: [] },
      'Utilities': { value: 0, securities: [] },
      'Energy': { value: 0, securities: [] },
      'Materials': { value: 0, securities: [] },
      'Real Estate': { value: 0, securities: [] },
      'Communication': { value: 0, securities: [] },
      'Other': { value: 0, securities: [] },
    };
    
    // Assign securities to sectors based on ticker symbol
    // This would be replaced by actual sector data in a real implementation
    securities.forEach(security => {
      let sector = 'Other';
      
      if (security.ticker) {
        const ticker = security.ticker.toUpperCase();
        
        // Dummy logic to assign sectors
        if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].includes(ticker)) {
          sector = 'Technology';
        } else if (['JPM', 'BAC', 'WFC', 'GS', 'MS'].includes(ticker)) {
          sector = 'Financial';
        } else if (['JNJ', 'PFE', 'MRK', 'UNH', 'ABBV'].includes(ticker)) {
          sector = 'Healthcare';
        }
        // ...add more sector assignments
      }
      
      sectors[sector].value += security.value;
      sectors[sector].securities.push(security);
    });
    
    const totalValue = securities.reduce((sum, s) => sum + s.value, 0);
    
    // Filter out sectors with no securities
    return Object.entries(sectors)
      .filter(([_, data]) => data.securities.length > 0)
      .map(([sector, data]) => ({
        sector,
        value: data.value,
        percentage: (data.value / totalValue) * 100,
        securities: data.securities,
      }));
  }
  
  /**
   * Get security type
   */
  private getSecurityType(security: SecurityAllocation): string {
    // This would be replaced by actual security type data
    if (security.name.toLowerCase().includes('cash')) {
      return 'cash';
    }
    
    if (security.ticker?.toUpperCase().includes('ETF')) {
      return 'etf';
    }
    
    // Default to equity
    return 'equity';
  }
  
  /**
   * Calculate risk metrics
   */
  private async calculateRiskMetrics(securities: SecurityAllocation[]) {
    // In a real implementation, this would calculate actual risk metrics
    // using historical price data for each security
    
    // For now, return placeholder values
    return {
      sharpeRatio: 1.2,
      beta: 0.85,
      alpha: 2.4,
      standardDeviation: 12.6,
      maxDrawdown: 15.3,
    };
  }
  
  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(userId: string, accountIds?: string[]) {
    // In a real implementation, this would calculate actual performance
    // using historical account value data
    
    // For now, return placeholder values
    return {
      daily: 0.2,
      weekly: 1.5,
      monthly: 2.8,
      ytd: 12.5,
      oneYear: 18.3,
      threeYear: 32.7,
      fiveYear: 64.2,
      tenYear: null,
      sinceInception: 64.2,
    };
  }
}

export const portfolioAnalysisService = new PortfolioAnalysisService();
```

### 2.3 Tax Optimization Service

```typescript
// src/services/taxOptimizationService.ts
interface TaxLotData {
  id: string;
  holdingId: string;
  securityId: string;
  acquisitionDate: Date;
  quantity: number;
  costBasis: number;
  price: number;
  currentValue: number;
  gain: number;
  gainPercentage: number;
  holdingPeriod: number; // in days
  isLongTerm: boolean;
}

interface TaxHarvestOpportunity {
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

interface TaxOptimizationSummary {
  totalHarvestableAmount: number;
  estimatedTaxSavings: number;
  harvestableLots: TaxLotData[];
  harvestOpportunities: TaxHarvestOpportunity[];
}

class TaxOptimizationService {
  /**
   * Get tax optimization recommendations
   */
  async getTaxOptimizationRecommendations(
    userId: string,
    taxYear: number,
    accountIds?: string[]
  ): Promise<TaxOptimizationSummary> {
    // Get tax lots for the user's holdings
    const taxLots = await this.getTaxLots(userId, accountIds);
    
    // Identify lots with losses
    const lotsWithLosses = taxLots.filter(lot => lot.gain < 0);
    
    // Group lots by security
    const lossesBySecurityId: Record<string, {
      securityId: string;
      ticker?: string;
      name: string;
      totalLoss: number;
      lots: TaxLotData[];
    }> = {};
    
    lotsWithLosses.forEach(lot => {
      if (!lossesBySecurityId[lot.securityId]) {
        lossesBySecurityId[lot.securityId] = {
          securityId: lot.securityId,
          ticker: lot.ticker,
          name: lot.name,
          totalLoss: 0,
          lots: [],
        };
      }
      
      lossesBySecurityId[lot.securityId].totalLoss += lot.gain;
      lossesBySecurityId[lot.securityId].lots.push(lot);
    });
    
    // Calculate tax savings based on user's tax rate
    // In a real implementation, we would use the user's tax rate
    // For now, use 25% as a default tax rate
    const taxRate = 0.25;
    
    // Generate harvest opportunities
    const harvestOpportunities: TaxHarvestOpportunity[] = Object.values(lossesBySecurityId)
      .map(security => {
        const taxSavingsEstimate = Math.abs(security.totalLoss) * taxRate;
        
        return {
          securityId: security.securityId,
          ticker: security.ticker,
          name: security.name,
          totalLoss: security.totalLoss,
          lots: security.lots,
          taxSavingsEstimate,
          suggestedAction: taxSavingsEstimate > 50 ? 'harvest' : 'hold',
          suggestedAlternatives: this.getSuggestedAlternatives(security.securityId),
        };
      })
      .filter(opportunity => opportunity.suggestedAction === 'harvest')
      .sort((a, b) => Math.abs(b.totalLoss) - Math.abs(a.totalLoss));
    
    // Calculate total harvestable amount and tax savings
    const totalHarvestableAmount = harvestOpportunities.reduce(
      (sum, opportunity) => sum + Math.abs(opportunity.totalLoss),
      0
    );
    
    const estimatedTaxSavings = totalHarvestableAmount * taxRate;
    
    const harvestableLots = harvestOpportunities.flatMap(opportunity => opportunity.lots);
    
    return {
      totalHarvestableAmount,
      estimatedTaxSavings,
      harvestableLots,
      harvestOpportunities,
    };
  }
  
  /**
   * Get tax lots for holdings
   */
  private async getTaxLots(userId: string, accountIds?: string[]): Promise<TaxLotData[]> {
    // In a real implementation, we would fetch actual tax lot data
    // from the database. For now, generate dummy data.
    
    // Get holdings
    try {
      let query = `
        SELECT h.*, s.*, a.user_id
        FROM investment_holdings h
        JOIN investment_accounts a ON h.investment_account_id = a.id
        JOIN securities s ON h.security_id = s.id
        WHERE a.user_id = $1 AND a.deleted_at IS NULL AND a.is_closed = false
      `;
      
      const queryParams = [userId];
      
      if (accountIds && accountIds.length > 0) {
        query += ` AND a.id IN (${accountIds.map((_, i) => `$${i + 2}`).join(',')})`;
        queryParams.push(...accountIds);
      }
      
      const result = await db.query(query, queryParams);
      
      // Generate tax lots for each holding
      const taxLots: TaxLotData[] = [];
      
      result.rows.forEach(row => {
        // Split the holding into 1-3 tax lots
        const numLots = Math.floor(Math.random() * 3) + 1;
        const quantity = row.quantity;
        const costBasis = row.cost_basis || row.value;
        const lotSize = quantity / numLots;
        
        for (let i = 0; i < numLots; i++) {
          // Random acquisition date in the past 1-3 years
          const daysAgo = Math.floor(Math.random() * 1000) + 30;
          const acquisitionDate = new Date();
          acquisitionDate.setDate(acquisitionDate.getDate() - daysAgo);
          
          // Random cost basis variation
          const lotCostBasisPerShare = (costBasis / quantity) * (0.9 + Math.random() * 0.2);
          const lotQuantity = lotSize;
          const lotCostBasis = lotCostBasisPerShare * lotQuantity;
          
          // Current price and value
          const lotPrice = row.institution_price || row.close_price || (row.value / row.quantity);
          const lotValue = lotPrice * lotQuantity;
          
          // Calculate gain
          const lotGain = lotValue - lotCostBasis;
          const lotGainPercentage = (lotGain / lotCostBasis) * 100;
          
          taxLots.push({
            id: `lot-${row.id}-${i}`,
            holdingId: row.id,
            securityId: row.security_id,
            ticker: row.ticker_symbol,
            name: row.name,
            acquisitionDate,
            quantity: lotQuantity,
            costBasis: lotCostBasis,
            price: lotPrice,
            currentValue: lotValue,
            gain: lotGain,
            gainPercentage: lotGainPercentage,
            holdingPeriod: daysAgo,
            isLongTerm: daysAgo > 365,
          });
        }
      });
      
      return taxLots;
    } catch (error) {
      console.error('Error getting tax lots:', error);
      throw error;
    }
  }
  
  /**
   * Get suggested alternative securities
   */
  private getSuggestedAlternatives(securityId: string) {
    // In a real implementation, we would use a security database
    // to find similar securities for tax-loss harvesting
    
    // For now, return placeholder data
    return [
      {
        securityId: 'alt-1',
        ticker: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        correlation: 0.95,
        expense_ratio: 0.03,
      },
      {
        securityId: 'alt-2',
        ticker: 'ITOT',
        name: 'iShares Core S&P Total U.S. Stock Market ETF',
        correlation: 0.94,
        expense_ratio: 0.03,
      },
      {
        securityId: 'alt-3',
        ticker: 'SCHB',
        name: 'Schwab U.S. Broad Market ETF',
        correlation: 0.93,
        expense_ratio: 0.03,
      },
    ];
  }
}

export const taxOptimizationService = new TaxOptimizationService();
```

### 2.4 Investment Portfolio UI Components

#### 2.4.1 Portfolio Dashboard Component
```tsx
// src/components/features/investment/PortfolioDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { portfolioAnalysisService } from '../../../services/portfolioAnalysisService';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetAllocationChart } from './AssetAllocationChart';
import { SectorAllocationChart } from './SectorAllocationChart';
import { PerformanceChart } from './PerformanceChart';
import { HoldingsTable } from './HoldingsTable';
import { Card } from '../../common            
ponents/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';

const PortfolioDashboard: React.FC = () => {
  // State
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Load portfolio analysis
  const {
    execute: loadPortfolioAnalysis,
    data: portfolioAnalysis,
    loading: isLoading,
    error,
  } = useAsyncAction(portfolioAnalysisService.getPortfolioAnalysis);
  
  // Load accounts
  const {
    execute: loadAccounts,
    loading: isLoadingAccounts,
  } = useAsyncAction(async () => {
    const response = await api.get('/api/investment-accounts');
    setAccounts(response.accounts);
    // By default, select all accounts
    setSelectedAccounts(response.accounts.map((account: any) => account.id));
    return response.accounts;
  });
  
  // Load data on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);
  
  // Load portfolio analysis when accounts change
  useEffect(() => {
    if (selectedAccounts.length > 0) {
      loadPortfolioAnalysis(selectedAccounts);
    }
  }, [selectedAccounts, loadPortfolioAnalysis]);
  
  // Handle account selection
  const handleAccountSelectionChange = (accountId: string, selected: boolean) => {
    if (selected) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Investment Portfolio</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
      )}
      
      {/* Account selection */}
      <Card className="mb-6">
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Accounts</h3>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAccounts(accounts.map(a => a.id))}
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAccounts([])}
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {isLoadingAccounts ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`account-${account.id}`}
                    checked={selectedAccounts.includes(account.id)}
                    onChange={e => handleAccountSelectionChange(account.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`account-${account.id}`} className="flex-1">
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-gray-500">
                      {account.institution_name} • {account.type} • ${account.balance.toLocaleString()}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Portfolio summary */}
      {!isLoading && portfolioAnalysis && (
        <PortfolioSummary
          totalValue={portfolioAnalysis.totalValue}
          cashValue={portfolioAnalysis.cashValue}
          investedValue={portfolioAnalysis.investedValue}
          totalGain={portfolioAnalysis.totalGain}
          totalGainPercentage={portfolioAnalysis.totalGainPercentage}
          performance={portfolioAnalysis.performanceMetrics}
        />
      )}
      
      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'holdings', label: 'Holdings' },
          { id: 'performance', label: 'Performance' },
          { id: 'tax', label: 'Tax' },
        ]}
      />
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : portfolioAnalysis ? (
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <AssetAllocationChart
                assetAllocation={portfolioAnalysis.assetAllocation}
              />
              <SectorAllocationChart
                sectorAllocation={portfolioAnalysis.sectorAllocation}
              />
            </div>
          )}
          
          {activeTab === 'holdings' && (
            <div className="mt-6">
              <HoldingsTable
                securities={portfolioAnalysis.securities}
              />
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="mt-6">
              <PerformanceChart
                performance={portfolioAnalysis.performanceMetrics}
                riskMetrics={portfolioAnalysis.riskMetrics}
              />
            </div>
          )}
          
          {activeTab === 'tax' && (
            <div className="mt-6">
              <TaxOptimizationDashboard
                accountIds={selectedAccounts}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Select accounts to view portfolio analysis
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
```

#### 2.4.2 Asset Allocation Chart Component
```tsx
// src/components/features/investment/AssetAllocationChart.tsx
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card } from '../../components/common/Card';

interface AssetAllocationChartProps {
  assetAllocation: Array<{
    assetClass: string;
    value: number;
    percentage: number;
  }>;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  assetAllocation,
}) => {
  // Color scheme for asset classes
  const COLORS = [
    '#0088FE', // Stocks (Blue)
    '#00C49F', // Bonds (Green)
    '#FFBB28', // Cash (Yellow)
    '#FF8042', // ETFs (Orange)
    '#A569BD', // Mutual Funds (Purple)
    '#5D6D7E', // Derivatives (Grey)
    '#EC7063', // Other (Red)
  ];
  
  // Format data for chart
  const chartData = assetAllocation.map(item => ({
    name: item.assetClass,
    value: item.value,
    percentage: item.percentage,
  }));
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p className="text-lg">
            ${data.value.toLocaleString()}
          </p>
          <p className="text-gray-600">
            {data.percentage.toFixed(2)}% of portfolio
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold">Asset Allocation</h3>
      </Card.Header>
      <Card.Body>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  
                  return (
                    percent > 0.05 && (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry, index) => (
                  <span className="text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Asset Class</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {assetAllocation.map((item, index) => (
                <tr key={item.assetClass}>
                  <td className="py-2">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 mr-2 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      {item.assetClass}
                    </div>
                  </td>
                  <td className="py-2 text-right">${item.value.toLocaleString()}</td>
                  <td className="py-2 text-right">{item.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};
```

## 3. Financial Health Score System Implementation

### 3.1 Score Algorithm Implementation

```typescript
// src/services/financialHealthService.ts
// Financial health scoring service

interface FinancialHealthScoreParams {
  emergencySavings: {
    availableCash: number;
    monthlyExpenses: number;
  };
  debt: {
    mortgageBalance?: number;
    homeValue?: number;
    creditCardBalance: number;
    creditCardLimit: number;
    studentLoanBalance?: number;
    autoLoanBalance?: number;
    otherDebtBalance?: number;
    monthlyIncome: number;
  };
  retirement: {
    age: number;
    retirementBalance: number;
    annualIncome: number;
    annualContribution: number;
  };
  spending: {
    monthlyIncome: number;
    monthlyExpenses: number;
    necessitiesExpenses: number;
  };
  insurance: {
    hasHealthInsurance: boolean;
    hasLifeInsurance: boolean;
    hasDisabilityInsurance: boolean;
    hasHomeInsurance: boolean;
    hasAutoInsurance: boolean;
  };
  credit: {
    creditScore?: number;
    totalAccounts?: number;
    delinquencies?: number;
    hardInquiries?: number;
  };
}

interface FinancialHealthScore {
  overallScore: number;
  components: {
    emergencySavings: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
    debt: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
    retirement: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
    spending: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
    insurance: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
    credit: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      recommendations: string[];
    };
  };
  statusSummary: 'excellent' | 'good' | 'fair' | 'poor';
  topRecommendations: string[];
  historicalScores: Array<{
    date: string;
    score: number;
  }>;
}

class FinancialHealthService {
  /**
   * Calculate financial health score
   */
  async calculateFinancialHealthScore(
    userId: string
  ): Promise<FinancialHealthScore> {
    // In a real implementation, we would fetch the user's financial data
    // from the database and calculate the score based on that data
    
    // For now, we'll generate a sample score with realistic parameters
    
    // Get user's financial data
    const financialData = await this.getUserFinancialData(userId);
    
    // Calculate component scores
    const emergencySavingsScore = this.calculateEmergencySavingsScore(financialData.emergencySavings);
    const debtScore = this.calculateDebtScore(financialData.debt);
    const retirementScore = this.calculateRetirementScore(financialData.retirement);
    const spendingScore = this.calculateSpendingScore(financialData.spending);
    const insuranceScore = this.calculateInsuranceScore(financialData.insurance);
    const creditScore = this.calculateCreditScore(financialData.credit);
    
    // Calculate overall score (weighted average)
    const weights = {
      emergencySavings: 0.2,
      debt: 0.2,
      retirement: 0.15,
      spending: 0.15,
      insurance: 0.1,
      credit: 0.2,
    };
    
    const overallScore = 
      emergencySavingsScore.score * weights.emergencySavings +
      debtScore.score * weights.debt +
      retirementScore.score * weights.retirement +
      spendingScore.score * weights.spending +
      insuranceScore.score * weights.insurance +
      creditScore.score * weights.credit;
    
    // Determine overall status
    const statusSummary = this.getStatusFromScore(overallScore);
    
    // Get historical scores
    const historicalScores = await this.getHistoricalScores(userId);
    
    // Generate top recommendations
    const allRecommendations = [
      ...emergencySavingsScore.recommendations,
      ...debtScore.recommendations,
      ...retirementScore.recommendations,
      ...spendingScore.recommendations,
      ...insuranceScore.recommendations,
      ...creditScore.recommendations,
    ];
    
    // Sort recommendations by priority (lower scores first)
    const componentScores = [
      { name: 'emergencySavings', score: emergencySavingsScore.score },
      { name: 'debt', score: debtScore.score },
      { name: 'retirement', score: retirementScore.score },
      { name: 'spending', score: spendingScore.score },
      { name: 'insurance', score: insuranceScore.score },
      { name: 'credit', score: creditScore.score },
    ];
    
    componentScores.sort((a, b) => a.score - b.score);
    
    // Get recommendations from lowest scoring components
    const topRecommendations: string[] = [];
    let recommendationCount = 0;
    
    for (const component of componentScores) {
      let recommendations;
      
      switch (component.name) {
        case 'emergencySavings':
          recommendations = emergencySavingsScore.recommendations;
          break;
        case 'debt':
          recommendations = debtScore.recommendations;
          break;
        case 'retirement':
          recommendations = retirementScore.recommendations;
          break;
        case 'spending':
          recommendations = spendingScore.recommendations;
          break;
        case 'insurance':
          recommendations = insuranceScore.recommendations;
          break;
        case 'credit':
          recommendations = creditScore.recommendations;
          break;
      }
      
      for (const recommendation of recommendations) {
        if (!topRecommendations.includes(recommendation)) {
          topRecommendations.push(recommendation);
          recommendationCount++;
          
          if (recommendationCount >= 3) {
            break;
          }
        }
      }
      
      if (recommendationCount >= 3) {
        break;
      }
    }
    
    return {
      overallScore,
      components: {
        emergencySavings: emergencySavingsScore,
        debt: debtScore,
        retirement: retirementScore,
        spending: spendingScore,
        insurance: insuranceScore,
        credit: creditScore,
      },
      statusSummary,
      topRecommendations,
      historicalScores,
    };
  }
  
  /**
   * Get user's financial data
   */
  private async getUserFinancialData(userId: string): Promise<FinancialHealthScoreParams> {
    // In a real implementation, we would fetch this data from the database
    // For now, we'll return sample data
    
    // Get account balances from the database
    let cashBalance = 0;
    let homeValue = 0;
    let mortgageBalance = 0;
    let creditCardBalance = 0;
    let creditCardLimit = 0;
    let studentLoanBalance = 0;
    let autoLoanBalance = 0;
    let otherDebtBalance = 0;
    let retirementBalance = 0;
    
    try {
      // Get bank accounts
      const bankAccountsQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'depository'
        AND subtype IN ('checking', 'savings')
      `;
      
      const bankAccountsResult = await db.query(bankAccountsQuery, [userId]);
      cashBalance = bankAccountsResult.rows[0]?.total_balance || 0;
      
      // Get mortgage data
      const mortgageQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'loan'
        AND subtype = 'mortgage'
      `;
      
      const mortgageResult = await db.query(mortgageQuery, [userId]);
      mortgageBalance = mortgageResult.rows[0]?.total_balance || 0;
      
      // Home value would come from a separate table or external service
      // For now, estimate based on mortgage balance
      if (mortgageBalance > 0) {
        homeValue = mortgageBalance * 1.5; // Assumption: home worth 1.5x mortgage
      }
      
      // Get credit card data
      const creditCardQuery = `
        SELECT 
          SUM(balance) as total_balance,
          SUM(COALESCE(balance_limit, 0)) as total_limit
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'credit'
        AND subtype = 'credit card'
      `;
      
      const creditCardResult = await db.query(creditCardQuery, [userId]);
      creditCardBalance = Math.abs(creditCardResult.rows[0]?.total_balance || 0);
      creditCardLimit = creditCardResult.rows[0]?.total_limit || 10000; // Default if not available
      
      // Get student loan data
      const studentLoanQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'loan'
        AND subtype = 'student'
      `;
      
      const studentLoanResult = await db.query(studentLoanQuery, [userId]);
      studentLoanBalance = studentLoanResult.rows[0]?.total_balance || 0;
      
      // Get auto loan data
      const autoLoanQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'loan'
        AND subtype = 'auto'
      `;
      
      const autoLoanResult = await db.query(autoLoanQuery, [userId]);
      autoLoanBalance = autoLoanResult.rows[0]?.total_balance || 0;
      
      // Get other loans
      const otherLoanQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'loan'
        AND subtype NOT IN ('mortgage', 'student', 'auto')
      `;
      
      const otherLoanResult = await db.query(otherLoanQuery, [userId]);
      otherDebtBalance = otherLoanResult.rows[0]?.total_balance || 0;
      
      // Get retirement accounts
      const retirementQuery = `
        SELECT SUM(balance) as total_balance
        FROM plaid_accounts
        WHERE user_id = $1 
        AND type = 'investment'
        AND (
          subtype IN ('401k', 'ira', 'roth', 'roth ira', '403b', '457b')
          OR name LIKE '%retirement%'
          OR name LIKE '%401k%'
          OR name LIKE '%ira%'
        )
      `;
      
      const retirementResult = await db.query(retirementQuery, [userId]);
      retirementBalance = retirementResult.rows[0]?.total_balance || 0;
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Continue with default values if there's an error
    }
    
    // Get monthly income and expenses
    const monthlyIncome = await this.calculateMonthlyIncome(userId);
    const monthlyExpenses = await this.calculateMonthlyExpenses(userId);
    const necessitiesExpenses = await this.calculateNecessitiesExpenses(userId);
    
    // Get user profile data
    const userQuery = `
      SELECT * FROM users WHERE id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    // Default age to 35 if not available
    const age = user?.age || 35;
    
    // Insurance data would come from a separate table
    // For now, assume the user has basic coverage
    const insurance = {
      hasHealthInsurance: true,
      hasLifeInsurance: false,
      hasDisabilityInsurance: false,
      hasHomeInsurance: homeValue > 0,
      hasAutoInsurance: autoLoanBalance > 0,
    };
    
    // Credit data would come from a separate service
    // For now, use a default good credit score
    const credit = {
      creditScore: 720,
      totalAccounts: 5,
      delinquencies: 0,
      hardInquiries: 1,
    };
    
    return {
      emergencySavings: {
        availableCash: cashBalance,
        monthlyExpenses,
      },
      debt: {
        mortgageBalance,
        homeValue,
        creditCardBalance,
        creditCardLimit,
        studentLoanBalance,
        autoLoanBalance,
        otherDebtBalance,
        monthlyIncome,
      },
      retirement: {
        age,
        retirementBalance,
        annualIncome: monthlyIncome * 12,
        annualContribution: retirementBalance * 0.1, // Estimate annual contribution as 10% of balance
      },
      spending: {
        monthlyIncome,
        monthlyExpenses,
        necessitiesExpenses,
      },
      insurance,
      credit,
    };
  }
  
  /**
   * Calculate monthly income
   */
  private async calculateMonthlyIncome(userId: string): Promise<number> {
    try {
      // Look at recent income transactions (deposits)
      const incomeQuery = `
        SELECT AVG(amount) as avg_income
        FROM transactions
        WHERE user_id = $1 
        AND amount > 0
        AND (
          category = 'Income' 
          OR category LIKE '%Payroll%' 
          OR category LIKE '%Deposit%'
        )
        AND date >= $2
      `;
      
      // Get transactions from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const incomeResult = await db.query(incomeQuery, [
        userId,
        threeMonthsAgo.toISOString().split('T')[0],
      ]);
      
      const monthlyIncome = incomeResult.rows[0]?.avg_income || 5000; // Default to $5000 if no data
      
      return monthlyIncome;
    } catch (error) {
      console.error('Error calculating monthly income:', error);
      return 5000; // Default value
    }
  }
  
  /**
   * Calculate monthly expenses
   */
  private async calculateMonthlyExpenses(userId: string): Promise<number> {
    try {
      // Look at recent expense transactions
      const expenseQuery = `
        SELECT ABS(SUM(amount)) / 3 as monthly_expenses
        FROM transactions
        WHERE user_id = $1 
        AND amount < 0
        AND date >= $2
      `;
      
      // Get transactions from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const expenseResult = await db.query(expenseQuery, [
        userId,
        threeMonthsAgo.toISOString().split('T')[0],
      ]);
      
      const monthlyExpenses = expenseResult.rows[0]?.monthly_expenses || 3500; // Default to $3500 if no data
      
      return monthlyExpenses;
    } catch (error) {
      console.error('Error calculating monthly expenses:', error);
      return 3500; // Default value
    }
  }
  
  /**
   * Calculate necessities expenses (housing, food, utilities, etc.)
   */
  private async calculateNecessitiesExpenses(userId: string): Promise<number> {
    try {
      // Look at necessary expense categories
      const necessitiesQuery = `
        SELECT ABS(SUM(amount)) / 3 as monthly_necessities
        FROM transactions
        WHERE user_id = $1 
        AND amount < 0
        AND (
          category IN ('Rent', 'Mortgage', 'Home', 'Utilities', 'Food and Drink', 'Groceries', 'Transportation')
          OR category LIKE '%Housing%'
          OR category LIKE '%Grocery%'
          OR category LIKE '%Utilities%'
          OR category LIKE '%Insurance%'
        )
        AND date >= $2
      `;
      
      // Get transactions from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const necessitiesResult = await db.query(necessitiesQuery, [
        userId,
        threeMonthsAgo.toISOString().split('T')[0],
      ]);
      
      const necessitiesExpenses = necessitiesResult.rows[0]?.monthly_necessities || 2000; // Default if no data
      
      return necessitiesExpenses;
    } catch (error) {
      console.error('Error calculating necessities expenses:', error);
      return 2000; // Default value
    }
  }
  
  /**
   * Calculate emergency savings score
   */
  private calculateEmergencySavingsScore(data: { availableCash: number; monthlyExpenses: number }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const { availableCash, monthlyExpenses } = data;
    
    // Calculate months of expenses covered
    const monthsCovered = monthlyExpenses > 0 ? availableCash / monthlyExpenses : 0;
    
    // Score based on months covered (0-100)
    let score = 0;
    const recommendations: string[] = [];
    
    if (monthsCovered >= 6) {
      // 6+ months: excellent (90-100)
      score = 90 + Math.min(10, (monthsCovered - 6) * 2);
      recommendations.push("Consider investing part of your emergency fund for better returns while maintaining 6 months of expenses in cash.");
    } else if (monthsCovered >= 3) {
      // 3-6 months: good (70-89)
      score = 70 + (monthsCovered - 3) * (20 / 3);
      recommendations.push("Continue building your emergency fund to reach 6 months of expenses.");
    } else if (monthsCovered >= 1) {
      // 1-3 months: fair (40-69)
      score = 40 + (monthsCovered -
1) * (30 / 2);
      recommendations.push("Prioritize building your emergency fund to at least 3-6 months of expenses.");
      recommendations.push("Consider reducing non-essential expenses to accelerate emergency fund growth.");
    } else {
      // Less than 1 month: poor (0-39)
      score = Math.max(0, monthsCovered * 40);
      recommendations.push("Start an emergency fund immediately with at least 1 month of expenses.");
      recommendations.push("Consider temporary gig work to build initial emergency savings.");
      recommendations.push("Look for expenses you can cut to redirect funds to your emergency savings.");
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Calculate debt score
   */
  private calculateDebtScore(data: {
    mortgageBalance?: number;
    homeValue?: number;
    creditCardBalance: number;
    creditCardLimit: number;
    studentLoanBalance?: number;
    autoLoanBalance?: number;
    otherDebtBalance?: number;
    monthlyIncome: number;
  }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const {
      mortgageBalance = 0,
      homeValue = 0,
      creditCardBalance,
      creditCardLimit,
      studentLoanBalance = 0,
      autoLoanBalance = 0,
      otherDebtBalance = 0,
      monthlyIncome,
    } = data;
    
    const recommendations: string[] = [];
    
    // Calculate debt-to-income ratio (monthly)
    // Assume average interest rates for each loan type
    const mortgagePayment = this.calculateLoanPayment(mortgageBalance, 3.5, 30 * 12);
    const studentLoanPayment = this.calculateLoanPayment(studentLoanBalance, 5.0, 10 * 12);
    const autoLoanPayment = this.calculateLoanPayment(autoLoanBalance, 4.5, 5 * 12);
    const otherDebtPayment = this.calculateLoanPayment(otherDebtBalance, 8.0, 3 * 12);
    const creditCardPayment = creditCardBalance * 0.03; // Minimum payment ~3% of balance
    
    const totalMonthlyDebtPayments = mortgagePayment + studentLoanPayment + 
                                     autoLoanPayment + otherDebtPayment + creditCardPayment;
    
    const debtToIncomeRatio = monthlyIncome > 0 ? totalMonthlyDebtPayments / monthlyIncome : 0;
    
    // Calculate credit utilization ratio
    const creditUtilizationRatio = creditCardLimit > 0 ? creditCardBalance / creditCardLimit : 0;
    
    // Calculate loan-to-value ratio for mortgage
    const loanToValueRatio = homeValue > 0 ? mortgageBalance / homeValue : 0;
    
    // Score components
    let dtiScore = 0;
    if (debtToIncomeRatio <= 0.2) {
      dtiScore = 100; // Excellent: debt payments < 20% of income
    } else if (debtToIncomeRatio <= 0.36) {
      dtiScore = 90 - ((debtToIncomeRatio - 0.2) * (50 / 0.16)); // Good: 20-36%
    } else if (debtToIncomeRatio <= 0.5) {
      dtiScore = 40 - ((debtToIncomeRatio - 0.36) * (30 / 0.14)); // Fair: 36-50%
    } else {
      dtiScore = Math.max(0, 10 - ((debtToIncomeRatio - 0.5) * 20)); // Poor: >50%
    }
    
    let creditUtilizationScore = 0;
    if (creditUtilizationRatio <= 0.1) {
      creditUtilizationScore = 100; // Excellent: <10% utilization
    } else if (creditUtilizationRatio <= 0.3) {
      creditUtilizationScore = 90 - ((creditUtilizationRatio - 0.1) * (40 / 0.2)); // Good: 10-30%
    } else if (creditUtilizationRatio <= 0.5) {
      creditUtilizationScore = 50 - ((creditUtilizationRatio - 0.3) * (30 / 0.2)); // Fair: 30-50%
    } else {
      creditUtilizationScore = Math.max(0, 20 - ((creditUtilizationRatio - 0.5) * 40)); // Poor: >50%
    }
    
    let ltvScore = 0;
    if (homeValue === 0 || mortgageBalance === 0) {
      ltvScore = 100; // No mortgage or no data
    } else if (loanToValueRatio <= 0.5) {
      ltvScore = 100; // Excellent: LTV <= 50%
    } else if (loanToValueRatio <= 0.8) {
      ltvScore = 90 - ((loanToValueRatio - 0.5) * (30 / 0.3)); // Good: 50-80%
    } else if (loanToValueRatio <= 0.95) {
      ltvScore = 60 - ((loanToValueRatio - 0.8) * (30 / 0.15)); // Fair: 80-95%
    } else {
      ltvScore = Math.max(0, 30 - ((loanToValueRatio - 0.95) * 60)); // Poor: >95%
    }
    
    // Weights for each component
    const weights = {
      dti: 0.5,
      creditUtilization: 0.3,
      ltv: 0.2,
    };
    
    // Calculate weighted score
    const score = (
      dtiScore * weights.dti +
      creditUtilizationScore * weights.creditUtilization +
      ltvScore * weights.ltv
    );
    
    // Generate recommendations
    if (debtToIncomeRatio > 0.36) {
      recommendations.push("Reduce your debt-to-income ratio by paying down high-interest debt.");
      recommendations.push("Consider debt consolidation to lower interest rates.");
    }
    
    if (creditUtilizationRatio > 0.3) {
      recommendations.push("Reduce credit card balances to less than 30% of your available credit.");
    }
    
    if (loanToValueRatio > 0.8 && homeValue > 0) {
      recommendations.push("Consider making extra mortgage payments to build equity.");
    }
    
    if (creditCardBalance > 0) {
      recommendations.push("Prioritize paying off high-interest credit card debt.");
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Calculate retirement score
   */
  private calculateRetirementScore(data: {
    age: number;
    retirementBalance: number;
    annualIncome: number;
    annualContribution: number;
  }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const { age, retirementBalance, annualIncome, annualContribution } = data;
    
    const recommendations: string[] = [];
    
    // Calculate retirement savings ratio (multiple of annual income)
    const retirementRatio = annualIncome > 0 ? retirementBalance / annualIncome : 0;
    
    // Calculate savings rate (percentage of income saved for retirement)
    const savingsRate = annualIncome > 0 ? (annualContribution / annualIncome) * 100 : 0;
    
    // Target retirement ratios by age
    let targetRatio = 0;
    if (age < 30) {
      targetRatio = 0.5;
    } else if (age < 35) {
      targetRatio = 1.5;
    } else if (age < 40) {
      targetRatio = 2.5;
    } else if (age < 45) {
      targetRatio = 3.5;
    } else if (age < 50) {
      targetRatio = 4.5;
    } else if (age < 55) {
      targetRatio = 6;
    } else if (age < 60) {
      targetRatio = 7.5;
    } else if (age < 65) {
      targetRatio = 9;
    } else {
      targetRatio = 10;
    }
    
    // Score for retirement savings
    let savingsScore = 0;
    if (retirementRatio >= targetRatio) {
      // At or above target: excellent (80-100)
      savingsScore = 80 + Math.min(20, (retirementRatio / targetRatio - 1) * 40);
    } else if (retirementRatio >= targetRatio * 0.7) {
      // 70-100% of target: good (60-79)
      savingsScore = 60 + ((retirementRatio / targetRatio - 0.7) * (20 / 0.3));
    } else if (retirementRatio >= targetRatio * 0.4) {
      // 40-70% of target: fair (40-59)
      savingsScore = 40 + ((retirementRatio / targetRatio - 0.4) * (20 / 0.3));
    } else {
      // Below 40% of target: poor (0-39)
      savingsScore = Math.max(0, (retirementRatio / targetRatio) * 100);
    }
    
    // Score for savings rate
    let rateScore = 0;
    if (savingsRate >= 15) {
      // 15%+ savings rate: excellent (80-100)
      rateScore = 80 + Math.min(20, (savingsRate - 15) * 1);
    } else if (savingsRate >= 10) {
      // 10-15% savings rate: good (60-79)
      rateScore = 60 + ((savingsRate - 10) * 4);
    } else if (savingsRate >= 5) {
      // 5-10% savings rate: fair (40-59)
      rateScore = 40 + ((savingsRate - 5) * 4);
    } else {
      // Below 5% savings rate: poor (0-39)
      rateScore = Math.max(0, savingsRate * 8);
    }
    
    // Calculate weighted score (savings amount weighted higher for older individuals)
    const savingsWeight = Math.min(0.8, 0.4 + (age - 25) * 0.01);
    const rateWeight = 1 - savingsWeight;
    
    const score = (savingsScore * savingsWeight) + (rateScore * rateWeight);
    
    // Generate recommendations
    if (retirementRatio < targetRatio) {
      recommendations.push(`Increase retirement savings to reach ${targetRatio}x your annual income by age ${age}.`);
    }
    
    if (savingsRate < 15) {
      recommendations.push("Aim to save at least 15% of your income for retirement.");
    }
    
    if (age < 35 && retirementBalance === 0) {
      recommendations.push("Start retirement savings now to benefit from compound growth.");
    }
    
    if (age >= 50 && savingsRate < 20) {
      recommendations.push("Consider making catch-up contributions to your retirement accounts.");
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Calculate spending score
   */
  private calculateSpendingScore(data: {
    monthlyIncome: number;
    monthlyExpenses: number;
    necessitiesExpenses: number;
  }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const { monthlyIncome, monthlyExpenses, necessitiesExpenses } = data;
    
    const recommendations: string[] = [];
    
    // Calculate savings rate (percentage of income saved)
    const savingsRate = monthlyIncome > 0 
      ? Math.max(0, (monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;
    
    // Calculate necessities ratio (percentage of expenses for necessities)
    const necessitiesRatio = monthlyExpenses > 0
      ? necessitiesExpenses / monthlyExpenses
      : 0;
    
    // Score for savings rate
    let savingsScore = 0;
    if (savingsRate >= 20) {
      // 20%+ savings rate: excellent (80-100)
      savingsScore = 80 + Math.min(20, (savingsRate - 20) * 1);
    } else if (savingsRate >= 10) {
      // 10-20% savings rate: good (60-79)
      savingsScore = 60 + ((savingsRate - 10) * 2);
    } else if (savingsRate >= 5) {
      // 5-10% savings rate: fair (40-59)
      savingsScore = 40 + ((savingsRate - 5) * 4);
    } else {
      // Below 5% savings rate: poor (0-39)
      savingsScore = Math.max(0, savingsRate * 8);
    }
    
    // Score for necessities ratio (50-30-20 rule)
    let necessitiesScore = 0;
    if (necessitiesRatio <= 0.5) {
      // <= 50% on necessities: excellent (80-100)
      necessitiesScore = 80 + Math.min(20, (0.5 - necessitiesRatio) * 100);
    } else if (necessitiesRatio <= 0.65) {
      // 50-65% on necessities: good (60-79)
      necessitiesScore = 60 + ((0.65 - necessitiesRatio) * (20 / 0.15));
    } else if (necessitiesRatio <= 0.8) {
      // 65-80% on necessities: fair (40-59)
      necessitiesScore = 40 + ((0.8 - necessitiesRatio) * (20 / 0.15));
    } else {
      // >80% on necessities: poor (0-39)
      necessitiesScore = Math.max(0, (1 - necessitiesRatio) * 200);
    }
    
    // Calculate weighted score
    const weights = {
      savings: 0.6,
      necessities: 0.4,
    };
    
    const score = (savingsScore * weights.savings) + (necessitiesScore * weights.necessities);
    
    // Generate recommendations
    if (savingsRate < 20) {
      recommendations.push("Aim to save at least 20% of your income.");
    }
    
    if (necessitiesRatio > 0.5) {
      recommendations.push("Try to reduce necessary expenses to 50% or less of your total spending.");
    }
    
    if (monthlyExpenses > monthlyIncome) {
      recommendations.push("Reduce expenses to stop spending more than you earn.");
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Calculate insurance score
   */
  private calculateInsuranceScore(data: {
    hasHealthInsurance: boolean;
    hasLifeInsurance: boolean;
    hasDisabilityInsurance: boolean;
    hasHomeInsurance: boolean;
    hasAutoInsurance: boolean;
  }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const {
      hasHealthInsurance,
      hasLifeInsurance,
      hasDisabilityInsurance,
      hasHomeInsurance,
      hasAutoInsurance,
    } = data;
    
    const recommendations: string[] = [];
    
    // Calculate score based on insurance coverage
    let score = 0;
    let coverageCount = 0;
    
    // Health insurance is most important
    if (hasHealthInsurance) {
      score += 50;
      coverageCount++;
    } else {
      recommendations.push("Get health insurance as soon as possible.");
    }
    
    // Life insurance
    if (hasLifeInsurance) {
      score += 15;
      coverageCount++;
    } else {
      recommendations.push("Consider life insurance if you have dependents.");
    }
    
    // Disability insurance
    if (hasDisabilityInsurance) {
      score += 15;
      coverageCount++;
    } else {
      recommendations.push("Consider disability insurance to protect your income.");
    }
    
    // Home insurance
    if (hasHomeInsurance) {
      score += 10;
      coverageCount++;
    } else {
      recommendations.push("Get home/renters insurance to protect your property.");
    }
    
    // Auto insurance
    if (hasAutoInsurance) {
      score += 10;
      coverageCount++;
    } else {
      recommendations.push("Ensure you have auto insurance if you own a vehicle.");
    }
    
    // Adjust score based on coverage completeness
    if (coverageCount === 5) {
      // Full coverage: boost score
      score = Math.min(100, score + 10);
    } else if (coverageCount <= 1) {
      // Very limited coverage: penalty
      score = Math.max(0, score - 10);
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Calculate credit score component
   */
  private calculateCreditScore(data: {
    creditScore?: number;
    totalAccounts?: number;
    delinquencies?: number;
    hardInquiries?: number;
  }): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const {
      creditScore = 700,
      totalAccounts = 5,
      delinquencies = 0,
      hardInquiries = 0,
    } = data;
    
    const recommendations: string[] = [];
    
    // Score based on credit score (FICO scale: 300-850)
    let score = 0;
    
    if (creditScore >= 800) {
      // 800-850: excellent (90-100)
      score = 90 + ((creditScore - 800) * (10 / 50));
    } else if (creditScore >= 740) {
      // 740-799: very good (80-89)
      score = 80 + ((creditScore - 740) * (10 / 60));
    } else if (creditScore >= 670) {
      // 670-739: good (70-79)
      score = 70 + ((creditScore - 670) * (10 / 70));
    } else if (creditScore >= 580) {
      // 580-669: fair (40-69)
      score = 40 + ((creditScore - 580) * (30 / 90));
    } else {
      // 300-579: poor (0-39)
      score = Math.max(0, ((creditScore - 300) * (40 / 280)));
    }
    
    // Adjust score based on other factors
    
    // Delinquencies (major negative factor)
    if (delinquencies > 0) {
      score = Math.max(0, score - (delinquencies * 10));
      recommendations.push("Address any delinquent accounts to improve your credit score.");
    }
    
    // Hard inquiries (minor negative factor)
    if (hardInquiries > 2) {
      score = Math.max(0, score - ((hardInquiries - 2) * 3));
      recommendations.push("Limit new credit applications to reduce hard inquiries on your credit report.");
    }
    
    // Account mix (positive factor)
    if (totalAccounts >= 4 && totalAccounts <= 6) {
      // Ideal range
      score = Math.min(100, score + 5);
    } else if (totalAccounts < 4) {
      score = Math.max(0, score - 5);
      recommendations.push("Consider building a more diverse credit mix over time.");
    }
    
    // Generate recommendations based on credit score
    if (creditScore < 670) {
      recommendations.push("Focus on improving your credit score by paying bills on time and reducing debt.");
    }
    
    if (creditScore < 580) {
      recommendations.push("Consider a secured credit card to rebuild your credit history.");
    }
    
    // Get status based on score
    const status = this.getStatusFromScore(score);
    
    return {
      score,
      status,
      recommendations,
    };
  }
  
  /**
   * Get status from score
   */
  private getStatusFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 80) {
      return 'excellent';
    } else if (score >= 60) {
      return 'good';
    } else if (score >= 40) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
  
  /**
   * Calculate loan payment
   */
  private calculateLoanPayment(balance: number, annualRate: number, termMonths: number): number {
    if (balance <= 0 || termMonths <= 0) {
      return 0;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) {
      return balance / termMonths;
    }
    
    const payment = balance * (
      monthlyRate * Math.pow(1 + monthlyRate, termMonths)
    ) / (
      Math.pow(1 + monthlyRate, termMonths) - 1
    );
    
    return payment;
  }
  
  /**
   * Get historical financial health scores
   */
  private async getHistoricalScores(userId: string): Promise<Array<{
    date: string;
    score: number;
  }>> {
    try {
      // Get historical scores from the database
      const query = `
        SELECT date, score
        FROM financial_health_scores
        WHERE user_id = $1
        ORDER BY date ASC
      `;
      
      const result = await db.query(query, [userId]);
      
      // If there are no historical scores, generate some
      if (result.rows.length === 0) {
        // Generate 6 months of fake data
        const scores = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          
          // Random score between 60 and 75 with some variation
          const baseScore = 67;
          const variation = Math.floor(Math.random() * 15) - 5;
          const score = baseScore + variation;
          
          scores.push({
            date: date.toISOString().substring(0, 10),
            score,
          });
        }
        
        return scores;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error getting historical scores:', error);
      // Return empty array if there's an error
      return [];
    }
  }
}

export const financialHealthService = new FinancialHealthService();
```

### 3.2 Financial Health UI Components

```tsx
// src/components/features/financialHealth/FinancialHealthDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { financialHealthService } from '../../../services/financialHealthService';
import { FinancialHealthScore } from './FinancialHealthScore';
import { FinancialHealthDetails } from './FinancialHealthDetails';
import { FinancialHealthHistory } from './FinancialHealthHistory';
import { FinancialHealthRecommendations } from './FinancialHealthRecommendations';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const FinancialHealthDashboard: React.FC = () => {
  // Load financial health score
  const {
    execute: loadFinancialHealthScore,
    data: financialHealthScore,
    loading: isLoading,
    error,
  } = useAsyncAction(financialHealthService.calculateFinancialHealthScore);
  
  // Load score on mount
  useEffect(() => {
    loadFinancialHealthScore();
  }, [loadFinancialHealthScore]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Health Score</h1>
        <Button
          variant="primary"
          onClick={() => loadFinancialHealthScore()}
          loading={isLoading}
        >
          Refresh Score
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : financialHealthScore ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FinancialHealthScore 
                score={financialHealthScore.overallScore}
                status={financialHealthScore.statusSummary}
              />
            </div>
            <div className="lg:col-span-2">
              <FinancialHealthRecommendations
                recommendations={financialHealthScore.topRecommendations}
              />
            </div>
          </div>
          
          <FinancialHealthHistory
            historicalScores={financialHealthScore.historicalScores}
          />
          
          <FinancialHealthDetails
            components={financialHealthScore.components}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No financial health data available
        </div>
      )}
    </div>
  );
};

export default FinancialHealthDashboard;

// src/components/features/financialHealth/FinancialHealthScore.tsx
import React from 'react';
import { Card } from '../../components/common/Card';

interface FinancialHealthScoreProps {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  score,
  status,
}) => {
  // Get color based on status
  const getStatusColor = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const statusColor = getStatusColor(status);
  
  return (
    <Card>
      <Card.Body>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={status === 'excellent' ? '#059669' : 
                       status === 'good' ? '#2563eb' :
                       status === 'fair' ? '#d97706' : '#dc2626'}
                strokeWidth="10"
                strokeDasharray={`${Math.min(100, score) * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              
              {/* Score text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold"
                fill="currentColor"
              >
                {Math.round(score)}
              </text>
              
              <text
                x="50"
                y="65"
                textAnchor="middle"
                className="text-sm"
                fill="#6b7280"
              >
                out of 100
              </text>
            </svg>
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-xl font-semibold">Your Financial Health is</h3>
            <p className={`text-2xl font-bold ${statusColor}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
```

## 4. Implementation Coordination

To ensure successful implementation of the Finance Intelligence Suite, a phased approach is essential. Below is a structured implementation plan with specific tasks for each phase:

### Phase 1: Foundation (Months 1-2)

1. **Database Schema Enhancements**
   - Create investment-related tables (accounts, holdings, securities, transactions)
   - Add financial health score tables (historical scores, component scores)
   - Add cash flow prediction support tables (recurring transactions)

2. **Core API Architecture**
   - Implement Controller-Service-Repository pattern
   - Develop transaction safety features (BaseRepository with transaction support)
   - Create comprehensive error handling and logging

3. **Authentication & Authorization**
   - Implement token verification in all function endpoints
   - Create role-based access control system
   - Add data isolation for multi-user support

### Phase 2: Cash Flow Prediction (Months 2-3)

1. **Data Processing**
   - Implement transaction categorization service
   - Develop recurring transaction detection
   - Create data preparation utilities

2. **Model Development**
   - Implement time series prediction model
   - Create recurring transaction model
   - Develop hybrid model integration

3. **UI Implementation**      
3. **UI Implementation**
   - Build cash flow prediction dashboard
   - Create interactive charts for visualizations
   - Implement alert system for potential issues
   - Add what-if scenario analysis tools

4. **Testing & Validation**
   - Create unit tests for prediction models
   - Develop integration tests for API endpoints
   - Conduct usability testing of UI components
   - Perform accuracy validation with historical data

### Phase 3: Investment Portfolio Analysis (Months 3-5)

1. **Enhanced Plaid Integration**
   - Update Plaid API to capture investment data
   - Create investment account synchronization
   - Implement securities and holdings tracking
   - Develop transaction categorization for investments

2. **Portfolio Analysis Engine**
   - Build asset allocation analysis service
   - Develop risk metrics calculation (Sharpe ratio, beta, etc.)
   - Create tax optimization algorithms
   - Implement performance tracking

3. **UI Implementation**
   - Create portfolio dashboard
   - Develop interactive allocation charts
   - Build holdings table with filtering/sorting
   - Implement tax harvesting opportunity display

4. **Security & Compliance**
   - Add field-level encryption for sensitive data
   - Implement strict data access controls
   - Create audit logging for portfolio operations
   - Add compliance documentation

### Phase 4: Financial Health Score (Months 5-6)

1. **Score Algorithm Implementation**
   - Build component scoring algorithms (emergency savings, debt, etc.)
   - Implement weighted score aggregation
   - Create recommendation engine
   - Develop historical tracking system

2. **Data Integration**
   - Connect to transaction data for spending analysis
   - Integrate with account data for balance tracking
   - Implement recurring bill detection
   - Create demographic comparison module

3. **UI Implementation**
   - Develop financial health score dashboard
   - Create component breakdown visualizations
   - Build recommendation display system
   - Implement trend tracking charts

4. **Personalization Engine**
   - Create recommendation prioritization system
   - Implement goal-based score weighting
   - Develop life-stage specific scoring
   - Add notification system for score changes

### Phase 5: Integration & Refinement (Months 6-8)

1. **Cross-Feature Integration**
   - Connect cash flow predictions to financial health
   - Integrate portfolio analysis with cash flow
   - Link investment recommendations to health score
   - Create unified data processing pipeline

2. **Performance Optimization**
   - Implement caching for expensive calculations
   - Add batch processing for regular updates
   - Optimize database queries with proper indexing
   - Integrate front-end lazy loading

3. **User Experience Improvements**
   - Add onboarding flows for each module
   - Develop educational content
   - Create mobile optimizations
   - Implement progressive disclosure of complex features

4. **Analytics & Insights**
   - Develop cross-module insight generation
   - Create personalized notification system
   - Build automated recommendation pipeline
   - Implement A/B testing framework

## 5. Technical Dependencies

To successfully implement the Finance Intelligence Suite, several key technical dependencies must be addressed:

### 5.1 Core Libraries and Technologies

1. **Data Analysis & Machine Learning**
   - `mathjs`: For numerical calculations and statistics
   - `date-fns`: For robust date manipulation
   - `lodash`: For data transformation and manipulation
   - Consider adding more specialized ML packages like `ml-regression` for time series analysis

2. **Visualization**
   - `recharts`: For interactive charts
   - `d3.js`: For advanced visualizations
   - `react-table`: For data-heavy displays

3. **API Integration**
   - Enhanced Plaid client for investment data
   - Financial data APIs for market information
   - Tax information APIs for optimization

4. **Database Extensions**
   - Time-series database capabilities for historical data
   - Full-text search for transaction categorization
   - Advanced indexing for complex queries

### 5.2 Infrastructure Requirements

1. **Compute Resources**
   - Serverless functions with increased memory allocation
   - Longer execution timeouts for complex calculations
   - Scheduled jobs for data synchronization and model updates

2. **Storage**
   - Increased database capacity for historical data
   - Blob storage for documents and reports
   - Caching layer for performance optimization

3. **Security**
   - Enhanced encryption for sensitive financial data
   - Additional authentication factors for high-value operations
   - Compliance with financial data regulations

## 6. Risks and Mitigation Strategies

### 6.1 Technical Risks

1. **Data Quality Issues**
   - **Risk**: Inconsistent or missing transaction data affecting prediction accuracy
   - **Mitigation**: Implement data validation, cleansing pipelines, and fallback strategies for missing data

2. **Performance Bottlenecks**
   - **Risk**: Complex calculations causing slow response times
   - **Mitigation**: Implement background processing, caching, and incremental updates

3. **Integration Failures**
   - **Risk**: External API changes or failures
   - **Mitigation**: Add comprehensive error handling, retries, and fallback modes

### 6.2 User Adoption Risks

1. **Complexity Barrier**
   - **Risk**: Users find features too complex to understand or use
   - **Mitigation**: Progressive disclosure, in-app education, and simplified interfaces with optional advanced modes

2. **Trust Issues**
   - **Risk**: Users skeptical of recommendations or predictions
   - **Mitigation**: Transparent methodology, explanation of calculations, and accuracy tracking

3. **Data Privacy Concerns**
   - **Risk**: Users uncomfortable sharing financial data
   - **Mitigation**: Clear privacy policies, granular permissions, and local-only analysis options

## 7. Success Metrics

To measure the success of the Finance Intelligence Suite implementation, the following metrics should be tracked:

### 7.1 Technical Metrics

1. **Performance Metrics**
   - API response times under 200ms for 95% of requests
   - Prediction calculation time under 5 seconds
   - Database query performance under 100ms

2. **Reliability Metrics**
   - System uptime > 99.9%
   - Successful data synchronization rate > 98%
   - Error rate < 0.1% for critical operations

3. **Code Quality Metrics**
   - Test coverage > 80%
   - Static analysis issues < 5 per 1000 lines
   - Documentation coverage > 90%

### 7.2 Business Metrics

1. **Engagement Metrics**
   - Feature adoption rate > 60%
   - Weekly active usage > 30%
   - Session time increase > 20%

2. **Value Metrics**
   - Financial health score improvement > 10 points on average
   - Cash flow prediction accuracy > 85%
   - Tax savings recommendations > $500 per user

3. **Satisfaction Metrics**
   - Feature satisfaction score > 4.2/5
   - Net Promoter Score improvement > 15 points
   - Retention rate increase > 10%

## 8. Conclusion

The Finance Intelligence Suite represents a significant advancement in the capabilities of the Personal Finance Dashboard. By implementing the Cash Flow Prediction Engine, Investment Portfolio Analysis, and Financial Health Score System, the application will provide users with powerful tools for understanding, planning, and optimizing their financial life.

This comprehensive implementation plan provides a structured approach to developing these sophisticated features while maintaining data security, system performance, and user experience. By following this phased approach and addressing the technical dependencies and risks identified, the development team can successfully deliver a robust and valuable financial intelligence platform.

The end result will be a significantly enhanced Personal Finance Dashboard that not only tracks financial data but provides actionable insights, personalized recommendations, and forward-looking analysis to help users achieve their financial goals.