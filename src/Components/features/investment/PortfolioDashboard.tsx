import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetAllocation } from './AssetAllocation';
import { PerformanceChart } from './PerformanceChart';
import { RecentTransactions } from './RecentTransactions';
import Card from "../../../components/common/card_component/Card";
import { ResponsiveGrid } from '../../../components/layout/ResponsiveContainer';
import Button from "../../../components/common/button/Button";
import {
  ArrowTrendingUpIcon,
  ChartPieIcon,
  ScaleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Define time period options
type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y' | '5y' | 'all';

interface PortfolioDashboardProps {
  accountIds: string[];
  period?: TimePeriod;
  isLoading?: boolean;
  onPeriodChange?: (period: TimePeriod) => void;
  onAccountsChange?: (accountIds: string[]) => void;
  className?: string;
}

// Sample portfolio metrics data - in a real app, this would come from an API
const samplePortfolioMetrics = {
  totalValue: 48650.75,
  returns: {
    overall: 12.4,
    ytd: 8.2, 
    '1m': 1.5,
    '3m': 3.8,
    '1y': 10.5
  },
  riskScore: 65,
  dividendYield: 2.8,
  expenseRatio: 0.35
};

/**
 * Portfolio Metrics component to display key financial metrics
 */
const PortfolioMetrics: React.FC<{ metrics: typeof samplePortfolioMetrics, isLoading?: boolean }> = ({ 
  metrics,
  isLoading = false
}) => {
  const { isDarkMode } = useTheme();
  
  if (isLoading) {
    return (
      <Card>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Determine ROI color based on value
  const getRoiColor = (value: number): string => {
    if (value > 0) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (value < 0) return isDarkMode ? 'text-red-400' : 'text-red-600';
    return 'text-gray-500';
  };
  
  return (
    <Card>
      <Card.Header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolio Metrics</h2>
        <ScaleIcon className="h-5 w-5 text-blue-500" />
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</div>
            <div className="text-xl font-semibold">
              ${metrics.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Return</div>
            <div className={`text-xl font-semibold ${getRoiColor(metrics.returns.overall)}`}>
              {metrics.returns.overall > 0 ? '+' : ''}{metrics.returns.overall}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">YTD Return</div>
            <div className={`text-xl font-semibold ${getRoiColor(metrics.returns.ytd)}`}>
              {metrics.returns.ytd > 0 ? '+' : ''}{metrics.returns.ytd}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">1-Month Return</div>
            <div className={`text-xl font-semibold ${getRoiColor(metrics.returns['1m'])}`}>
              {metrics.returns['1m'] > 0 ? '+' : ''}{metrics.returns['1m']}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Risk Score</div>
            <div className="text-xl font-semibold">
              {metrics.riskScore}/100
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dividend Yield</div>
            <div className="text-xl font-semibold">
              {metrics.dividendYield}%
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * Period selector component for filtering portfolio data by time
 */
const PeriodSelector: React.FC<{
  activePeriod: TimePeriod;
  onChange: (period: TimePeriod) => void;
}> = ({ activePeriod, onChange }) => {
  const periods: { label: string; value: TimePeriod }[] = [
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
    { label: 'All', value: 'all' }
  ];
  
  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
      {periods.map(period => (
        <button
          key={period.value}
          className={`
            px-3 py-1 text-sm rounded-md transition-colors
            ${activePeriod === period.value
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ 
  accountIds,
  period = '1y',
  isLoading = false,
  onPeriodChange,
  onAccountsChange: _onAccountsChange,
  className = ''
}) => {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(period);
  const { isDarkMode: _isDarkMode } = useTheme();
  
  // Update active period when prop changes
  useEffect(() => {
    setActivePeriod(period);
  }, [period]);
  
  // Handle period change
  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setActivePeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };
  
  // Memoize metrics to prevent unnecessary re-renders
  const metrics = useMemo(() => {
    return samplePortfolioMetrics;
    // In a real app, this would depend on accountIds and period
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountIds, activePeriod]);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Investment Portfolio</h1>
        <PeriodSelector activePeriod={activePeriod} onChange={handlePeriodChange} />
      </div>
      
      {/* Portfolio Summary */}
      <div>
        <PortfolioSummary isLoading={isLoading} />
      </div>
      
      {/* Portfolio Metrics */}
      <div>
        <PortfolioMetrics metrics={metrics} isLoading={isLoading} />
      </div>
      
      {/* Performance and Allocation */}
      <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="6">
        <Card>
          <Card.Header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Performance History</h2>
            <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
          </Card.Header>
          <Card.Body className="p-4">
            <PerformanceChart isLoading={isLoading} period={activePeriod} />
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Asset Allocation</h2>
            <ChartPieIcon className="h-5 w-5 text-blue-500" />
          </Card.Header>
          <Card.Body className="p-4">
            <AssetAllocation isLoading={isLoading} />
          </Card.Body>
        </Card>
      </ResponsiveGrid>
      
      {/* Recent Transactions */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <ClockIcon className="h-5 w-5 text-blue-500" />
        </Card.Header>
        <Card.Body className="p-0">
          <RecentTransactions isLoading={isLoading} accountIds={accountIds} />
        </Card.Body>
        <Card.Footer>
          <Button variant="text" size="sm">View All Transactions</Button>
        </Card.Footer>
      </Card>
    </div>
  );
}; 