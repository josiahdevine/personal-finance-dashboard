import { PredictionModelMetricsRepository } from '../repositories/PredictionModelMetricsRepository';
import { CashFlowPredictionService } from './CashFlowPredictionService';
import { Transaction } from '../types/Transaction';
import { 
  ModelType, 
  PredictionModelMetrics,
  CashFlowPredictionConfig 
} from '../types/CashFlowPrediction';
import { parseISO } from 'date-fns';

interface ValidationWindow {
  startDate: string;
  endDate: string;
  trainingEnd: string;
}

interface ValidationMetrics {
  accuracy: number;
  meanAbsoluteError: number;
  meanSquaredError: number;
  rootMeanSquaredError: number;
  directionAccuracy: number;
  r2Score: number;
}

export class ModelValidationService {
  private metricsRepo: PredictionModelMetricsRepository;
  private predictionService: CashFlowPredictionService;

  constructor() {
    this.metricsRepo = new PredictionModelMetricsRepository();
    this.predictionService = new CashFlowPredictionService();
  }

  /**
   * Perform k-fold cross validation
   */
  async performCrossValidation(
    userId: string,
    transactions: Transaction[],
    config: CashFlowPredictionConfig,
    k = 5
  ): Promise<ValidationMetrics> {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    // Create k validation windows
    const windowSize = Math.floor(sortedTransactions.length / k);
    const windows: ValidationWindow[] = [];

    for (let i = 0; i < k; i++) {
      const startIdx = i * windowSize;
      const endIdx = startIdx + windowSize;
      
      windows.push({
        startDate: sortedTransactions[startIdx].date,
        endDate: sortedTransactions[endIdx - 1].date,
        trainingEnd: sortedTransactions[startIdx - 1]?.date || sortedTransactions[0].date
      });
    }

    // Run validation for each window
    const metrics = await Promise.all(
      windows.map(window => this.validateWindow(userId, window, config))
    );

    // Average the metrics
    return {
      accuracy: this.average(metrics.map(m => m.accuracy)),
      meanAbsoluteError: this.average(metrics.map(m => m.meanAbsoluteError)),
      meanSquaredError: this.average(metrics.map(m => m.meanSquaredError)),
      rootMeanSquaredError: this.average(metrics.map(m => m.rootMeanSquaredError)),
      directionAccuracy: this.average(metrics.map(m => m.directionAccuracy)),
      r2Score: this.average(metrics.map(m => m.r2Score))
    };
  }

  /**
   * Validate a single time window
   */
  private async validateWindow(
    userId: string,
    window: ValidationWindow,
    config: CashFlowPredictionConfig
  ): Promise<ValidationMetrics> {
    // Generate predictions for the window
    const predictions = await this.predictionService.generatePredictions(
      userId,
      {
        ...config,
        timeframeInDays: this.daysBetween(window.startDate, window.endDate)
      }
    );

    // Get actual transactions for the window
    const actuals = await this.getActualTransactions(
      userId,
      window.startDate,
      window.endDate
    );

    // Calculate metrics
    return this.calculateMetrics(predictions.dailyPredictions, actuals);
  }

  /**
   * Calculate validation metrics
   */
  private calculateMetrics(
    predictions: any[],
    actuals: Transaction[]
  ): ValidationMetrics {
    // Group actuals by date
    const actualsByDate = this.groupTransactionsByDate(actuals);

    // Calculate errors and statistics
    let sumSquaredError = 0;
    let sumAbsoluteError = 0;
    let correctDirections = 0;
    let totalPredictions = 0;
    let sumActual = 0;
    let sumPredicted = 0;
    let sumSquaredActual = 0;
    let sumSquaredPredicted = 0;
    let sumActualPredicted = 0;

    for (const prediction of predictions) {
      const date = prediction.date.toISOString().split('T')[0];
      const actualAmount = this.sumTransactions(actualsByDate[date] || []);
      const predictedAmount = prediction.value;

      // Accumulate statistics
      sumSquaredError += Math.pow(predictedAmount - actualAmount, 2);
      sumAbsoluteError += Math.abs(predictedAmount - actualAmount);
      
      if ((predictedAmount >= 0 && actualAmount >= 0) ||
          (predictedAmount < 0 && actualAmount < 0)) {
        correctDirections++;
      }

      // For R² calculation
      sumActual += actualAmount;
      sumPredicted += predictedAmount;
      sumSquaredActual += Math.pow(actualAmount, 2);
      sumSquaredPredicted += Math.pow(predictedAmount, 2);
      sumActualPredicted += actualAmount * predictedAmount;

      totalPredictions++;
    }

    // Calculate final metrics
    const meanSquaredError = sumSquaredError / totalPredictions;
    const meanAbsoluteError = sumAbsoluteError / totalPredictions;
    const directionAccuracy = (correctDirections / totalPredictions) * 100;

    // Calculate R² (coefficient of determination)
    const r2Score = this.calculateR2Score(
      totalPredictions,
      sumActual,
      sumPredicted,
      sumSquaredActual,
      sumSquaredPredicted,
      sumActualPredicted
    );

    // Calculate accuracy as 1 - normalized mean absolute error
    const maxAbsoluteError = Math.max(...predictions.map((p: any) => 
      Math.abs(p.value - this.sumTransactions(actualsByDate[p.date.toISOString().split('T')[0]] || []))
    ));
    const accuracy = 1 - (meanAbsoluteError / maxAbsoluteError);

    return {
      accuracy: accuracy * 100, // Convert to percentage
      meanAbsoluteError,
      meanSquaredError,
      rootMeanSquaredError: Math.sqrt(meanSquaredError),
      directionAccuracy,
      r2Score: r2Score * 100 // Convert to percentage
    };
  }

  /**
   * Calculate R² score
   */
  private calculateR2Score(
    n: number,
    sumY: number,
    sumYhat: number,
    sumY2: number,
    sumYhat2: number,
    sumYYhat: number
  ): number {
    const numerator = n * sumYYhat - sumY * sumYhat;
    const denominator = Math.sqrt(
      (n * sumY2 - Math.pow(sumY, 2)) *
      (n * sumYhat2 - Math.pow(sumYhat, 2))
    );
    return Math.max(0, numerator / denominator);
  }

  /**
   * Save validation metrics to database
   */
  async saveMetrics(
    userId: string,
    modelType: ModelType,
    metrics: ValidationMetrics,
    validationStartDate: string,
    validationEndDate: string
  ): Promise<PredictionModelMetrics> {
    return this.metricsRepo.saveMetrics({
      userId,
      modelType,
      accuracy: metrics.accuracy,
      meanAbsoluteError: metrics.meanAbsoluteError,
      meanSquaredError: metrics.meanSquaredError,
      rootMeanSquaredError: metrics.rootMeanSquaredError,
      validationStartDate,
      validationEndDate
    });
  }

  /**
   * Helper: Calculate average of numbers
   */
  private average(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * Helper: Calculate days between two dates
   */
  private daysBetween(startDate: string, endDate: string): number {
    return Math.ceil(
      (parseISO(endDate).getTime() - parseISO(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Helper: Group transactions by date
   */
  private groupTransactionsByDate(
    transactions: Transaction[]
  ): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const date = transaction.date.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  /**
   * Helper: Sum transaction amounts
   */
  private sumTransactions(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get actual transactions for a date range
   */
  private async getActualTransactions(
    _userId: string,
    _startDate: string,
    _endDate: string
  ): Promise<Transaction[]> {
    // In a real implementation, this would query the database
    // For now, we'll return an empty array
    return [];
  }
} 