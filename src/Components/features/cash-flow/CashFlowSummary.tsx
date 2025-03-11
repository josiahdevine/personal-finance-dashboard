import React from 'react';
import Card from "../../../components/common/Card";
import { Skeleton } from '../../../components/common/Skeleton';

interface CashFlowSummaryProps {
  currentBalance: number;
  projectedEndBalance: number;
  netCashFlow: number;
  projectedNetCashFlow: number;
  isLoading?: boolean;
  className?: string;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({
  currentBalance,
  projectedEndBalance,
  netCashFlow,
  projectedNetCashFlow,
  isLoading = false,
  className = '',
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get color based on amount (positive = green, negative = red)
  const getAmountColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  // Calculate percentage change between current and projected balance
  const getBalancePercentageChange = () => {
    if (currentBalance === 0) return 0;
    return ((projectedEndBalance - currentBalance) / Math.abs(currentBalance)) * 100;
  };
  
  const balanceChange = getBalancePercentageChange();
  // Renamed with underscore to indicate intentionally unused (for now)
  const _balanceChangeColor = getAmountColor(balanceChange);
  
  const summaryCards = [
    {
      title: 'Current Balance',
      value: currentBalance,
      subtitle: 'Available funds',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      change: null,
    },
    {
      title: 'Net Cash Flow',
      value: netCashFlow,
      subtitle: 'Historical total',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      change: projectedNetCashFlow,
      changeLabel: 'Projected',
    },
    {
      title: 'Projected Balance',
      value: projectedEndBalance,
      subtitle: 'End of period',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      change: balanceChange,
      changeLabel: '% Change',
      isPercentage: true,
    },
  ];
  
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 mt-4" />
            <Skeleton className="h-4 w-24 mt-2" />
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {summaryCards.map((card, index) => (
        <Card key={index} className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-700 dark:text-gray-300 font-medium">{card.title}</h3>
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              {card.icon}
            </div>
          </div>
          
          <div className="mt-4">
            <div className={`text-2xl font-bold ${card.value < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
              {formatCurrency(card.value)}
            </div>
            
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{card.subtitle}</span>
              
              {card.change !== null && (
                <div className="ml-auto flex items-center">
                  <span className={`text-sm font-medium ${getAmountColor(card.change)}`}>
                    {card.isPercentage
                      ? `${card.change >= 0 ? '+' : ''}${card.change.toFixed(1)}%`
                      : formatCurrency(card.change)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{card.changeLabel}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 