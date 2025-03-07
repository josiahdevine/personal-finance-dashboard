import React, { useState, useEffect } from 'react';
import { Card } from '../../common/Card';
import { Select } from '../../common/Select';
import { Toggle } from '../../common/Toggle';
import { CashFlowChart } from './CashFlowChart';
import { RecurringTransactionsList } from './RecurringTransactions';
import { ModelValidationStats } from './ModelValidationStats';
import { PredictionAlerts } from './PredictionAlerts';
import { ScenarioAnalysis } from './ScenarioAnalysis';
import { useAuth } from '../../../hooks/useAuth';

interface CashFlowPrediction {
  date: string;
  cashFlow: number;
  confidenceLow: number;
  confidenceHigh: number;
  recurringTransactions: Array<{
    merchantName: string;
    amount: number;
    category: string;
    isIncome: boolean;
  }>;
}

interface PredictionResponse {
  dailyPredictions: CashFlowPrediction[];
  weeklyPredictions: CashFlowPrediction[];
  monthlyPredictions: CashFlowPrediction[];
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
    relatedTransactions?: Array<{
      merchantName: string;
      amount: number;
      category: string;
    }>;
  }>;
}

interface DashboardConfig {
  timeframeInDays: number;
  modelType: 'time-series' | 'recurring-transaction' | 'hybrid';
  includePendingTransactions: boolean;
  includeRecurringTransactions: boolean;
  confidenceLevel: number;
}

export const CashFlowDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [config, setConfig] = useState<DashboardConfig>({
    timeframeInDays: 90,
    modelType: 'hybrid',
    includePendingTransactions: true,
    includeRecurringTransactions: true,
    confidenceLevel: 0.95
  });
  const [validationMetrics, setValidationMetrics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchPredictions();
      fetchValidationMetrics();
    }
  }, [user, config]);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeframeInDays: config.timeframeInDays.toString(),
        modelType: config.modelType,
        includePendingTransactions: config.includePendingTransactions.toString(),
        includeRecurringTransactions: config.includeRecurringTransactions.toString(),
        confidenceLevel: config.confidenceLevel.toString()
      });

      const response = await fetch(`/api/cash-flow/predictions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidationMetrics = async () => {
    try {
      const params = new URLSearchParams({
        modelType: config.modelType
      });

      const response = await fetch(`/api/cash-flow/model-validation?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch model validation metrics');
      }

      const data = await response.json();
      setValidationMetrics(data);
    } catch (err) {
      console.error('Error fetching validation metrics:', err);
    }
  };

  const handleConfigChange = (key: keyof DashboardConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (error) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prediction Model
              </label>
              <Select
                value={config.modelType}
                onChange={e => handleConfigChange('modelType', e.target.value)}
                options={[
                  { value: 'hybrid', label: 'Hybrid Model' },
                  { value: 'time-series', label: 'Time Series' },
                  { value: 'recurring-transaction', label: 'Recurring Transactions' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <Select
                value={config.timeframeInDays.toString()}
                onChange={e => handleConfigChange('timeframeInDays', parseInt(e.target.value))}
                options={[
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' },
                  { value: '180', label: '180 Days' },
                  { value: '365', label: '1 Year' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View
              </label>
              <Select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as any)}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-6">
            <Toggle
              label="Include Pending Transactions"
              checked={config.includePendingTransactions}
              onChange={value => handleConfigChange('includePendingTransactions', value)}
            />
            <Toggle
              label="Include Recurring Transactions"
              checked={config.includeRecurringTransactions}
              onChange={value => handleConfigChange('includeRecurringTransactions', value)}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cash Flow Chart */}
          <Card>
            <Card.Body>
              <h2 className="text-lg font-semibold mb-4">Cash Flow Predictions</h2>
              {predictions && (
                <CashFlowChart
                  predictions={{
                    totalPrediction: {
                      balance: predictions.totalPrediction.cashFlow,
                      trend: predictions.totalPrediction.cashFlow > 0 ? 'up' : 
                             predictions.totalPrediction.cashFlow < 0 ? 'down' : 'stable',
                      percentageChange: 0 // We don't have this data, so defaulting to 0
                    },
                    dailyPredictions: predictions.dailyPredictions.map(p => ({
                      date: p.date,
                      cashFlow: p.cashFlow,
                      confidenceLow: p.confidenceLow,
                      confidenceHigh: p.confidenceHigh
                    })),
                    weeklyPredictions: predictions.weeklyPredictions.map(p => ({
                      startDate: p.date,
                      endDate: p.date,
                      cashFlow: p.cashFlow,
                      confidenceLow: p.confidenceLow,
                      confidenceHigh: p.confidenceHigh
                    })),
                    monthlyPredictions: predictions.monthlyPredictions.map(p => ({
                      month: p.date,
                      cashFlow: p.cashFlow,
                      confidenceLow: p.confidenceLow,
                      confidenceHigh: p.confidenceHigh
                    })),
                    alerts: predictions.alerts.map(alert => ({
                      type: alert.severity === 'high' ? 'danger' : 
                            alert.severity === 'medium' ? 'warning' : 'info',
                      message: alert.message,
                      date: alert.date
                    })),
                    recurringTransactions: {
                      income: [],
                      expenses: []
                    }
                  }}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  isLoading={isLoading}
                />
              )}
            </Card.Body>
          </Card>

          {/* Scenario Analysis */}
          <Card>
            <Card.Body>
              <h2 className="text-lg font-semibold mb-4">What-If Scenarios</h2>
              {predictions && (
                <ScenarioAnalysis
                  basePredictions={predictions.dailyPredictions}
                  recurringTransactions={
                    predictions.dailyPredictions
                      .flatMap(p => p.recurringTransactions)
                      .filter((tx, index, self) =>
                        index === self.findIndex(t => t.merchantName === tx.merchantName)
                      )
                  }
                />
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Model Validation Stats */}
          {validationMetrics && (
            <Card>
              <Card.Body>
                <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
                <ModelValidationStats metrics={validationMetrics} />
              </Card.Body>
            </Card>
          )}

          {/* Alerts */}
          {predictions?.alerts && predictions.alerts.length > 0 && (
            <Card>
              <Card.Body>
                <h2 className="text-lg font-semibold mb-4">Alerts</h2>
                <PredictionAlerts alerts={predictions.alerts} />
              </Card.Body>
            </Card>
          )}

          {/* Recurring Transactions */}
          {predictions && config.includeRecurringTransactions && (
            <Card>
              <Card.Body>
                <h2 className="text-lg font-semibold mb-4">Recurring Transactions</h2>
                <RecurringTransactionsList
                  income={predictions.dailyPredictions
                    .flatMap(p => p.recurringTransactions)
                    .filter(tx => tx.isIncome)
                    .map(tx => ({
                      id: tx.merchantName,
                      name: tx.merchantName,
                      amount: tx.amount,
                      frequency: 'Monthly',
                      nextDate: new Date().toISOString()
                    }))}
                  expenses={predictions.dailyPredictions
                    .flatMap(p => p.recurringTransactions)
                    .filter(tx => !tx.isIncome)
                    .map(tx => ({
                      id: tx.merchantName,
                      name: tx.merchantName,
                      amount: tx.amount,
                      frequency: 'Monthly',
                      nextDate: new Date().toISOString()
                    }))}
                  isLoading={isLoading}
                />
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 