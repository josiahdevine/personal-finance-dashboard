import React, { useState, useEffect } from 'react';
import Card from "../../common/Card";
import { CashFlowChart } from './CashFlowChart';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { ResponsiveGrid } from '../../../components/common/ResponsiveGrid';
import { PeriodSelector } from '../../features/investment/PeriodSelector';
import { CashFlowAlerts } from './CashFlowAlerts';
import { CashFlowSummary } from './CashFlowSummary';

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

export type TimePeriod = '1m' | '3m' | '6m' | '1y' | 'all';

export interface CashFlowDashboardProps {
  accountIds?: string[];
  period?: TimePeriod;
  isLoading?: boolean;
  includeProjections?: boolean;
  onPeriodChange?: (period: TimePeriod) => void;
  className?: string;
}

interface CashFlowData {
  income: number[];
  expenses: number[];
  netCashFlow: number[];
  projectedIncome?: number[];
  projectedExpenses?: number[];
  projectedNetCashFlow?: number[];
  dates: string[];
  upcomingBills: UpcomingBill[];
  currentBalance: number;
  projectedEndBalance: number;
}

interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
}

const sampleCashFlowData: CashFlowData = {
  income: [4500, 4500, 4700, 4500, 4500, 5200],
  expenses: [3200, 3800, 3500, 3300, 3600, 3400],
  netCashFlow: [1300, 700, 1200, 1200, 900, 1800],
  projectedIncome: [4500, 4500, 4500, 4500],
  projectedExpenses: [3500, 3700, 3400, 3600],
  projectedNetCashFlow: [1000, 800, 1100, 900],
  dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  upcomingBills: [
    { id: '1', name: 'Rent', amount: 1200, dueDate: '2023-08-01', category: 'Housing', isPaid: false, isRecurring: true },
    { id: '2', name: 'Electricity', amount: 120, dueDate: '2023-08-05', category: 'Utilities', isPaid: false, isRecurring: true },
    { id: '3', name: 'Internet', amount: 80, dueDate: '2023-08-12', category: 'Utilities', isPaid: false, isRecurring: true },
    { id: '4', name: 'Car Insurance', amount: 150, dueDate: '2023-08-15', category: 'Insurance', isPaid: false, isRecurring: true },
  ],
  currentBalance: 6500,
  projectedEndBalance: 9300,
};

export const CashFlowDashboard: React.FC<CashFlowDashboardProps> = ({
  accountIds: _accountIds = [],
  period = '3m',
  isLoading = false,
  includeProjections = true,
  onPeriodChange,
  className = '',
}) => {
  const { user } = useAuth();
  const [_isLoadingInternal, setIsLoadingInternal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_timeframe, _setTimeframe] = useState('30d');
  const [_predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [config, setConfig] = useState<DashboardConfig>({
    timeframeInDays: 90,
    modelType: 'hybrid',
    includePendingTransactions: true,
    includeRecurringTransactions: true,
    confidenceLevel: 0.95
  });
  const [_validationMetrics, setValidationMetrics] = useState<any>(null);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(period);
  const { /* isDarkMode */ } = useTheme();
  
  useEffect(() => {
    if (user) {
      fetchPredictions();
      fetchValidationMetrics();
    }
  }, [user, config]);

  const fetchPredictions = async () => {
    try {
      setIsLoadingInternal(true);
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
      setIsLoadingInternal(false);
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

  const _handleConfigChange = (key: keyof DashboardConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setActivePeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
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
    <div className={`space-y-6 ${className}`}>
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Cash Flow Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Track your cash flow and upcoming expenses
          </p>
        </div>
        <PeriodSelector
          activePeriod={activePeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Cash Flow Summary Cards */}
      <ResponsiveGrid columns={{ sm: 1, md: 3 }} gap={6}>
        <CashFlowSummary 
          currentBalance={sampleCashFlowData.currentBalance}
          projectedEndBalance={sampleCashFlowData.projectedEndBalance}
          netCashFlow={sampleCashFlowData.netCashFlow.reduce((sum, value) => sum + value, 0)}
          projectedNetCashFlow={
            sampleCashFlowData.projectedNetCashFlow 
              ? sampleCashFlowData.projectedNetCashFlow.reduce((sum, value) => sum + value, 0) 
              : 0
          }
          isLoading={isLoading}
        />
      </ResponsiveGrid>

      {/* Cash Flow Chart */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Cash Flow History & Projections</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your income, expenses, and net cash flow over time
          </p>
        </div>
        <div className="h-80">
          <CashFlowChart 
            data={sampleCashFlowData}
            period={activePeriod}
            includeProjections={includeProjections}
            isLoading={isLoading}
          />
        </div>
      </Card>

      {/* Upcoming Bills */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Upcoming Bills</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage your upcoming payments
          </p>
        </div>
        <CashFlowAlerts 
          upcomingBills={sampleCashFlowData.upcomingBills}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default CashFlowDashboard; 