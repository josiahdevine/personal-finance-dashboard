import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import Card from "../../../components/common/Card";
import { ResponsiveGrid } from '../../../components/common/ResponsiveGrid';
import Button from "../../../components/common/button/Button";
import { PeriodSelector } from './PeriodSelector';
import LineChart from "../../../components/common/charts/LineChart";
import { Skeleton } from '../../../components/common/Skeleton';

// Types
export type InvestmentType = 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'other';
export type TimePeriod = '1m' | '3m' | '6m' | '1y' | 'all';

export interface InvestmentData {
  id: string;
  name: string;
  symbol: string;
  type: InvestmentType;
  currentPrice: number;
  purchasePrice: number;
  shares: number;
  purchaseDate: string;
  performanceData: {
    [key in TimePeriod]: {
      dates: string[];
      values: number[];
    };
  };
  fundamentals?: {
    marketCap?: number;
    peRatio?: number;
    dividendYield?: number;
    volume?: number;
    averageVolume?: number;
    high52Week?: number;
    low52Week?: number;
    beta?: number;
  }
}

export interface InvestmentDetailProps {
  investment?: InvestmentData;
  isLoading?: boolean;
  onBackClick?: () => void;
  className?: string;
}

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const getReturnColor = (value: number): string => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
};

export const InvestmentDetail: React.FC<InvestmentDetailProps> = ({
  investment,
  isLoading = false,
  onBackClick,
  className = '',
}) => {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('1y');
  const { isDarkMode } = useTheme();

  const handlePeriodChange = (period: TimePeriod) => {
    setActivePeriod(period);
  };

  // Calculate total value and return
  const calculateReturn = () => {
    if (!investment) return { value: 0, percentage: 0 };
    
    const totalValue = investment.currentPrice * investment.shares;
    const costBasis = investment.purchasePrice * investment.shares;
    const returnValue = totalValue - costBasis;
    const returnPercentage = (returnValue / costBasis) * 100;
    
    return { value: returnValue, percentage: returnPercentage };
  };

  const returns = calculateReturn();

  // Prepare chart data
  const prepareChartData = () => {
    if (!investment || !investment.performanceData[activePeriod]) {
      return { labels: [], datasets: [] };
    }

    const { dates, values } = investment.performanceData[activePeriod];
    
    return {
      labels: dates,
      datasets: [
        {
          label: investment.name,
          data: values,
          borderColor: isDarkMode ? '#38bdf8' : '#0284c7',
          backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.1)',
          fill: true,
        },
      ],
    };
  };

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={4} className="mb-6">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </ResponsiveGrid>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <ResponsiveGrid columns={{ sm: 1, md: 3 }} gap={4}>
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </ResponsiveGrid>
      </Card>
    );
  }

  // If no investment data, show empty state
  if (!investment) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Investment Details</h2>
          {onBackClick && (
            <Button variant="secondary" onClick={onBackClick}>
              Back to Portfolio
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg text-gray-500 mb-4">No investment selected</p>
          {onBackClick && (
            <Button variant="primary" onClick={onBackClick}>
              Return to Portfolio
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">{investment.name} ({investment.symbol})</h2>
            <p className="text-sm text-gray-500">{investment.type.replace('_', ' ').toUpperCase()}</p>
          </div>
          {onBackClick && (
            <Button variant="secondary" onClick={onBackClick}>
              Back to Portfolio
            </Button>
          )}
        </div>

        {/* Investment summary */}
        <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={4} className="mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Value</h3>
            <p className="text-2xl font-semibold">{formatCurrency(investment.currentPrice * investment.shares)}</p>
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${getReturnColor(returns.percentage)}`}>
                {returns.value >= 0 ? '+' : ''}{formatCurrency(returns.value)} ({returns.percentage >= 0 ? '+' : ''}
                {formatPercentage(returns.percentage)})
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatNumber(investment.shares)} shares at {formatCurrency(investment.currentPrice)}/share
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Investment Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-gray-500">Purchase Price</p>
                <p className="text-sm font-medium">{formatCurrency(investment.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Purchase Date</p>
                <p className="text-sm font-medium">{new Date(investment.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cost Basis</p>
                <p className="text-sm font-medium">{formatCurrency(investment.purchasePrice * investment.shares)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Return</p>
                <p className={`text-sm font-medium ${getReturnColor(returns.percentage)}`}>
                  {formatPercentage(returns.percentage)}
                </p>
              </div>
            </div>
          </Card>
        </ResponsiveGrid>

        {/* Performance chart */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Performance History</h3>
            <PeriodSelector
              activePeriod={activePeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>
          <div className="h-64">
            <LineChart data={prepareChartData()} />
          </div>
        </div>

        {/* Fundamentals */}
        {investment.fundamentals && (
          <div>
            <h3 className="text-lg font-medium mb-4">Fundamentals</h3>
            <ResponsiveGrid columns={{ sm: 2, md: 4 }} gap={4}>
              {investment.fundamentals.marketCap && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Market Cap</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(investment.fundamentals.marketCap)}
                  </p>
                </div>
              )}
              {investment.fundamentals.peRatio && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">P/E Ratio</p>
                  <p className="text-sm font-medium">
                    {investment.fundamentals.peRatio.toFixed(2)}
                  </p>
                </div>
              )}
              {investment.fundamentals.dividendYield && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Dividend Yield</p>
                  <p className="text-sm font-medium">
                    {formatPercentage(investment.fundamentals.dividendYield)}
                  </p>
                </div>
              )}
              {investment.fundamentals.beta && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Beta</p>
                  <p className="text-sm font-medium">
                    {investment.fundamentals.beta.toFixed(2)}
                  </p>
                </div>
              )}
              {investment.fundamentals.high52Week && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">52 Week High</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(investment.fundamentals.high52Week)}
                  </p>
                </div>
              )}
              {investment.fundamentals.low52Week && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">52 Week Low</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(investment.fundamentals.low52Week)}
                  </p>
                </div>
              )}
              {investment.fundamentals.volume && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-sm font-medium">
                    {formatNumber(investment.fundamentals.volume)}
                  </p>
                </div>
              )}
              {investment.fundamentals.averageVolume && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Avg Volume</p>
                  <p className="text-sm font-medium">
                    {formatNumber(investment.fundamentals.averageVolume)}
                  </p>
                </div>
              )}
            </ResponsiveGrid>
          </div>
        )}
      </Card>
    </motion.div>
  );
}; 