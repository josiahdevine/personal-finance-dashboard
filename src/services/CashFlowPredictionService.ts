import { RecurringTransactionRepository } from '../repositories/RecurringTransactionRepository';
import { CashFlowPredictionRepository } from '../repositories/CashFlowPredictionRepository';
import { PredictionModelMetricsRepository } from '../repositories/PredictionModelMetricsRepository';
import {
    CashFlowPredictionConfig,
    CashFlowPredictionResult,
    TimeSeriesDataPoint,
    RecurringTransactionPrediction
} from '../types/CashFlowPrediction';
import { format as formatDate, addDays } from 'date-fns';
import { Transaction } from '../types/Transaction';

export class CashFlowPredictionService {
    private recurringTransactionRepo: RecurringTransactionRepository;
    private predictionRepo: CashFlowPredictionRepository;
    private metricsRepo: PredictionModelMetricsRepository;

    constructor() {
        this.recurringTransactionRepo = new RecurringTransactionRepository();
        this.predictionRepo = new CashFlowPredictionRepository();
        this.metricsRepo = new PredictionModelMetricsRepository();
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
            timeframeInDays: 90,
            includePendingTransactions: true,
            includeRecurringTransactions: true,
            confidenceLevel: 0.95
        };

        // Merge provided config with defaults
        const mergedConfig = { ...defaultConfig, ...config };

        // Prepare data for prediction
        const predictionData = await this.preparePredictionData(userId, mergedConfig);

        // Generate predictions based on model type
        let predictions;
        switch (mergedConfig.modelType) {
            case 'time-series':
                predictions = await this.generateTimeSeriesPredictions(
                    predictionData.timeSeriesData,
                    mergedConfig
                );
                break;
            case 'recurring-transaction':
                predictions = await this.generateRecurringTransactionPredictions(
                    predictionData.recurringTransactions,
                    mergedConfig
                );
                break;
            case 'hybrid':
            default:
                predictions = await this.generateHybridPredictions(
                    predictionData,
                    mergedConfig
                );
                break;
        }

        // Save predictions to database
        await this.savePredictions(userId, predictions, mergedConfig.modelType);

        // Generate alerts
        const alerts = this.generateAlerts(predictions, predictionData);

        // Format response
        return {
            dailyPredictions: this.formatDailyPredictions(predictions.daily),
            weeklyPredictions: this.aggregateToWeekly(predictions.daily),
            monthlyPredictions: this.aggregateToMonthly(predictions.daily),
            totalPrediction: this.calculateTotalPrediction(predictions.daily),
            alerts
        };
    }

    /**
     * Prepare data for prediction
     */
    private async preparePredictionData(
        userId: string,
        config: CashFlowPredictionConfig
    ) {
        // Get historical transaction data
        const transactions = await this.getHistoricalTransactions(userId);

        // Get recurring transactions if enabled
        const recurringTransactions = config.includeRecurringTransactions
            ? await this.recurringTransactionRepo.findByUserId(userId)
            : [];

        // Convert transactions to time series data
        const timeSeriesData = this.convertToTimeSeriesData(transactions);

        return {
            transactions,
            recurringTransactions,
            timeSeriesData,
            accountBalances: await this.getAccountBalances(userId)
        };
    }

    /**
     * Generate time series predictions
     */
    private async generateTimeSeriesPredictions(
        timeSeriesData: TimeSeriesDataPoint[],
        config: CashFlowPredictionConfig
    ) {
        // Implement time series prediction logic here
        // This would use statistical methods like moving averages,
        // exponential smoothing, or more advanced ML models
        
        // For now, return a simple moving average prediction
        const predictions = this.calculateMovingAveragePredictions(
            timeSeriesData,
            config.timeframeInDays
        );

        return {
            daily: predictions,
            model: 'time-series'
        };
    }

    /**
     * Generate recurring transaction predictions
     */
    private async generateRecurringTransactionPredictions(
        recurringTransactions: any[],
        config: CashFlowPredictionConfig
    ) {
        const startDate = new Date();
        const endDate = addDays(startDate, config.timeframeInDays);
        const predictions: any[] = [];

        // Generate predictions for each day
        for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
            const dayPredictions = this.predictRecurringTransactionsForDay(
                recurringTransactions,
                date
            );

            predictions.push({
                date,
                value: dayPredictions.reduce((sum, p) => sum + p.amount, 0),
                confidenceLow: 0,
                confidenceHigh: 0,
                recurringTransactions: dayPredictions
            });
        }

        return {
            daily: predictions,
            model: 'recurring-transaction'
        };
    }

    /**
     * Generate hybrid predictions
     */
    private async generateHybridPredictions(
        data: any,
        config: CashFlowPredictionConfig
    ) {
        // Generate both types of predictions
        const timeSeriesPredictions = await this.generateTimeSeriesPredictions(
            data.timeSeriesData,
            config
        );

        const recurringPredictions = await this.generateRecurringTransactionPredictions(
            data.recurringTransactions,
            config
        );

        // Combine predictions with appropriate weights
        const combinedPredictions = this.combineModelPredictions(
            timeSeriesPredictions.daily,
            recurringPredictions.daily
        );

        return {
            daily: combinedPredictions,
            model: 'hybrid'
        };
    }

    /**
     * Calculate moving average predictions
     */
    private calculateMovingAveragePredictions(
        timeSeriesData: TimeSeriesDataPoint[],
        daysToPredict: number,
        windowSize = 30
    ) {
        const predictions: any[] = [];
        const values = timeSeriesData.map(point => point.value);
        
        // Calculate moving average of historical data
        const movingAverage = this.calculateMovingAverage(values, windowSize);
        const stdDev = this.calculateStandardDeviation(values);

        // Generate future predictions
        const startDate = new Date();
        for (let i = 0; i < daysToPredict; i++) {
            const date = addDays(startDate, i);
            const prediction = movingAverage[movingAverage.length - 1];
            const confidence = 1.96 * stdDev / Math.sqrt(windowSize); // 95% confidence interval

            predictions.push({
                date,
                value: prediction,
                confidenceLow: prediction - confidence,
                confidenceHigh: prediction + confidence,
                recurringTransactions: []
            });
        }

        return predictions;
    }

    /**
     * Calculate moving average
     */
    private calculateMovingAverage(values: number[], windowSize: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < values.length - windowSize + 1; i++) {
            const windowValues = values.slice(i, i + windowSize);
            const average = windowValues.reduce((sum, val) => sum + val, 0) / windowSize;
            result.push(average);
        }
        return result;
    }

    /**
     * Calculate standard deviation
     */
    private calculateStandardDeviation(values: number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
        return Math.sqrt(variance);
    }

    /**
     * Combine predictions from multiple models
     */
    private combineModelPredictions(
        timeSeriesPredictions: any[],
        recurringPredictions: any[]
    ): any[] {
        const combinedPredictions: any[] = [];

        // Create a map of dates to predictions
        const predictionMap = new Map<string, any>();

        // Add time series predictions to the map
        timeSeriesPredictions.forEach(prediction => {
            const dateStr = formatDate(prediction.date, 'yyyy-MM-dd');
            predictionMap.set(dateStr, {
                date: prediction.date,
                timeSeriesValue: prediction.value,
                confidenceLow: prediction.confidenceLow,
                confidenceHigh: prediction.confidenceHigh,
                recurringTransactions: []
            });
        });

        // Add recurring transactions
        recurringPredictions.forEach(prediction => {
            const dateStr = formatDate(prediction.date, 'yyyy-MM-dd');
            const existing = predictionMap.get(dateStr);

            if (existing) {
                existing.recurringTransactions = prediction.recurringTransactions;
            } else {
                predictionMap.set(dateStr, {
                    date: prediction.date,
                    timeSeriesValue: 0,
                    confidenceLow: 0,
                    confidenceHigh: 0,
                    recurringTransactions: prediction.recurringTransactions
                });
            }
        });

        // Combine predictions
        for (const [_, prediction] of predictionMap) {
            const recurringAmount = prediction.recurringTransactions.reduce(
                (sum: number, tx: any) => sum + tx.amount,
                0
            );

            // Weight the predictions
            const hasRecurring = prediction.recurringTransactions.length > 0;
            const timeSeriesWeight = hasRecurring ? 0.3 : 0.8;
            const recurringWeight = hasRecurring ? 0.7 : 0.2;

            const combinedValue = 
                prediction.timeSeriesValue * timeSeriesWeight +
                recurringAmount * recurringWeight;

            // Adjust confidence intervals
            const confidenceAdjustment = hasRecurring ? 0.6 : 1.0;
            const adjustedConfidenceLow = combinedValue - 
                (combinedValue - prediction.confidenceLow) * confidenceAdjustment;
            const adjustedConfidenceHigh = combinedValue +
                (prediction.confidenceHigh - combinedValue) * confidenceAdjustment;

            combinedPredictions.push({
                date: prediction.date,
                value: combinedValue,
                confidenceLow: adjustedConfidenceLow,
                confidenceHigh: adjustedConfidenceHigh,
                recurringTransactions: prediction.recurringTransactions
            });
        }

        // Sort by date
        return combinedPredictions.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Format daily predictions
     */
    private formatDailyPredictions(predictions: any[]): any[] {
        return predictions.map(day => ({
            date: formatDate(day.date, 'yyyy-MM-dd'),
            cashFlow: day.value,
            confidenceLow: day.confidenceLow,
            confidenceHigh: day.confidenceHigh,
            recurringTransactions: day.recurringTransactions.map((tx: any) => ({
                merchantName: tx.merchantName,
                amount: tx.amount,
                category: tx.category,
                isIncome: tx.amount > 0
            }))
        }));
    }

    /**
     * Aggregate daily predictions to weekly
     */
    private aggregateToWeekly(dailyPredictions: any[]): any[] {
        const weeks: any[] = [];
        let currentWeek = {
            startDate: dailyPredictions[0]?.date || '',
            endDate: '',
            cashFlow: 0,
            confidenceLow: 0,
            confidenceHigh: 0
        };

        let dayInWeek = 0;

        dailyPredictions.forEach((day, index) => {
            currentWeek.cashFlow += day.value;
            currentWeek.confidenceLow += day.confidenceLow;
            currentWeek.confidenceHigh += day.confidenceHigh;
            dayInWeek++;

            if (dayInWeek === 7 || index === dailyPredictions.length - 1) {
                currentWeek.endDate = formatDate(day.date, 'yyyy-MM-dd');
                weeks.push({ ...currentWeek });

                if (index < dailyPredictions.length - 1) {
                    const nextDate = addDays(day.date, 1);
                    currentWeek = {
                        startDate: formatDate(nextDate, 'yyyy-MM-dd'),
                        endDate: '',
                        cashFlow: 0,
                        confidenceLow: 0,
                        confidenceHigh: 0
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
        const months = new Map<string, {
            month: string;
            cashFlow: number;
            confidenceLow: number;
            confidenceHigh: number;
        }>();

        dailyPredictions.forEach(day => {
            const monthKey = formatDate(day.date, 'MMMM yyyy');
            const current = months.get(monthKey) || {
                month: monthKey,
                cashFlow: 0,
                confidenceLow: 0,
                confidenceHigh: 0
            };

            current.cashFlow += day.value;
            current.confidenceLow += day.confidenceLow;
            current.confidenceHigh += day.confidenceHigh;

            months.set(monthKey, current);
        });

        return Array.from(months.values());
    }

    /**
     * Calculate total prediction
     */
    private calculateTotalPrediction(dailyPredictions: any[]): any {
        return {
            cashFlow: dailyPredictions.reduce((sum, day) => sum + day.value, 0),
            confidenceLow: dailyPredictions.reduce((sum, day) => sum + day.confidenceLow, 0),
            confidenceHigh: dailyPredictions.reduce((sum, day) => sum + day.confidenceHigh, 0)
        };
    }

    /**
     * Generate alerts based on predictions
     */
    private generateAlerts(predictions: any, data: any): any[] {
        const alerts: any[] = [];
        let runningBalance = data.accountBalances.reduce(
            (sum: number, account: any) => sum + account.balance,
            0
        );

        predictions.daily.forEach((day: any) => {
            runningBalance += day.value;

            // Check for negative balance
            if (runningBalance < 0) {
                alerts.push({
                    date: formatDate(day.date, 'yyyy-MM-dd'),
                    type: 'negative-balance',
                    message: `Projected negative balance of $${Math.abs(runningBalance).toFixed(2)}`,
                    severity: runningBalance < -500 ? 'high' : runningBalance < -100 ? 'medium' : 'low'
                });
            }

            // Check for large expenses
            const largeExpenses = day.recurringTransactions.filter(
                (tx: any) => tx.amount < -200 && !tx.isIncome
            );

            if (largeExpenses.length > 0) {
                alerts.push({
                    date: formatDate(day.date, 'yyyy-MM-dd'),
                    type: 'large-expense',
                    message: `${largeExpenses.length} large expense(s) totaling $${Math.abs(
                        largeExpenses.reduce((sum: number, tx: any) => sum + tx.amount, 0)
                    ).toFixed(2)}`,
                    severity: 'medium',
                    relatedTransactions: largeExpenses
                });
            }

            // Check for unusual activity
            if (Math.abs(day.value) > 0 && (
                day.value < day.confidenceLow * 0.5 ||
                day.value > day.confidenceHigh * 1.5
            )) {
                alerts.push({
                    date: formatDate(day.date, 'yyyy-MM-dd'),
                    type: 'unusual-activity',
                    message: 'Unusual cash flow activity predicted',
                    severity: 'low'
                });
            }
        });

        return alerts;
    }

    /**
     * Save predictions to database
     */
    private async savePredictions(
        userId: string,
        predictions: any,
        modelType: string
    ): Promise<void> {
        const dailyPredictions = predictions.daily.map((day: any) => ({
            userId,
            predictionDate: formatDate(day.date, 'yyyy-MM-dd'),
            amount: day.value,
            confidenceLow: day.confidenceLow,
            confidenceHigh: day.confidenceHigh,
            modelType,
            timeframe: 'daily'
        }));

        await this.predictionRepo.savePredictions(dailyPredictions);
    }

    /**
     * Get historical transactions for a user
     */
    public async getHistoricalTransactions(_userId: string): Promise<Transaction[]> {
        // In a real implementation, this would query the database
        // For now, we'll return an empty array
        return [];
    }

    private async getAccountBalances(userId: string): Promise<any[]> {
        // TODO: Implement this method to fetch account balances from your account service
        const balances = await fetch(`/api/accounts/balances?userId=${userId}`).then(res => res.json());
        return balances;
    }

    private convertToTimeSeriesData(transactions: any[]): TimeSeriesDataPoint[] {
        // Group transactions by date
        const groupedByDate = transactions.reduce((acc: Record<string, number>, tx: any) => {
            const date = formatDate(new Date(tx.date), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + tx.amount;
            return acc;
        }, {});

        // Convert to time series data points
        return Object.entries(groupedByDate).map(([date, value]) => ({
            date: new Date(date),
            value
        }));
    }

    private predictRecurringTransactionsForDay(
        recurringTransactions: any[],
        date: Date
    ): RecurringTransactionPrediction[] {
        return recurringTransactions
            .filter(tx => this.shouldTransactionOccurOnDate(tx, date))
            .map(tx => ({
                date,
                amount: tx.amount,
                merchantName: tx.merchantName,
                category: tx.category,
                confidence: tx.confidence,
                isIncome: tx.amount > 0
            }));
    }

    private shouldTransactionOccurOnDate(transaction: any, date: Date): boolean {
        const lastDate = new Date(transaction.lastDate);

        switch (transaction.frequency) {
            case 'weekly':
                return date.getDay() === lastDate.getDay();
            case 'biweekly':
                const daysSinceLastDate = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceLastDate % 14 === 0;
            case 'monthly':
                return date.getDate() === (transaction.dayOfMonth || lastDate.getDate());
            case 'quarterly':
                const monthDiff = (date.getFullYear() - lastDate.getFullYear()) * 12 + date.getMonth() - lastDate.getMonth();
                return monthDiff % 3 === 0 && date.getDate() === lastDate.getDate();
            case 'annual':
                return date.getMonth() === lastDate.getMonth() && date.getDate() === lastDate.getDate();
            default:
                return false;
        }
    }

    /**
     * Get recurring transactions for a user
     */
    async getRecurringTransactions(userId: string) {
        return this.recurringTransactionRepo.findByUserId(userId);
    }

    /**
     * Get model validation metrics
     */
    async getModelValidation(userId: string, modelType: string) {
        const metrics = await this.metricsRepo.getLatestMetrics(userId, modelType as any);

        if (!metrics) {
            return {
                modelType,
                metrics: {
                    accuracy: 0,
                    meanAbsoluteError: 0,
                    meanSquaredError: 0,
                    rootMeanSquaredError: 0
                },
                validationPeriod: {
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                }
            };
        }

        return {
            modelType,
            metrics: {
                accuracy: metrics.accuracy,
                meanAbsoluteError: metrics.meanAbsoluteError,
                meanSquaredError: metrics.meanSquaredError,
                rootMeanSquaredError: metrics.rootMeanSquaredError
            },
            validationPeriod: {
                startDate: metrics.validationStartDate,
                endDate: metrics.validationEndDate
            }
        };
    }
} 