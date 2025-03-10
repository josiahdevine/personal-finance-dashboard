import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Skeleton } from '../../../components/common/Skeleton';
import { TimePeriod } from './CashFlowDashboard';

interface CashFlowChartProps {
  data: {
    income: number[];
    expenses: number[];
    netCashFlow: number[];
    projectedIncome?: number[];
    projectedExpenses?: number[];
    projectedNetCashFlow?: number[];
    dates: string[];
  };
  period: TimePeriod;
  includeProjections?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  period,
  includeProjections = true,
  isLoading = false,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  
  // This is a simplified version - in a real application,
  // we would use a chart library like Chart.js or Recharts
  
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <Skeleton className="h-full w-full min-h-[300px]" />
      </div>
    );
  }
  
  // Determine how many months of data to show based on period
  const getMonthsToShow = () => {
    switch (period) {
      case '1m': return 1;
      case '3m': return 3;
      case '6m': return 6;
      case '1y': return 12;
      case 'all': return data.dates.length;
      default: return 3;
    }
  };
  
  const monthsToShow = getMonthsToShow();
  
  // Create chart data for the selected period
  const historical = {
    labels: data.dates.slice(-monthsToShow),
    income: data.income.slice(-monthsToShow),
    expenses: data.expenses.slice(-monthsToShow),
    netCashFlow: data.netCashFlow.slice(-monthsToShow),
  };
  
  // Add projections if available and requested
  const projected = includeProjections && data.projectedIncome && data.projectedExpenses ? {
    labels: ['Proj 1', 'Proj 2', 'Proj 3', 'Proj 4'],
    income: data.projectedIncome,
    expenses: data.projectedExpenses,
    netCashFlow: data.projectedNetCashFlow || [],
  } : null;
  
  // Calculate max value for chart scaling
  const allValues = [
    ...historical.income, 
    ...historical.expenses,
    ...(projected ? projected.income : []),
    ...(projected ? projected.expenses : []),
  ];
  const maxValue = Math.max(...allValues) * 1.1; // Add 10% padding
  
  // Calculate chart dimensions
  const chartHeight = 300;
  const barWidth = 10;
  const groupWidth = barWidth * 3 + 6; // 3 bars per group with 2px spacing between bars
  const groupSpacing = 40;
  const groups = historical.labels.length + (projected ? projected.labels.length : 0);
  const chartWidth = (groupWidth + groupSpacing) * groups;
  
  // Colors
  const incomeColor = isDarkMode ? '#4ade80' : '#22c55e';
  const expenseColor = isDarkMode ? '#f87171' : '#ef4444';
  const netColor = isDarkMode ? '#60a5fa' : '#3b82f6';
  const _gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const projectionBackground = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  
  return (
    <div className={`relative w-full overflow-x-auto ${className}`}>
      <div style={{ height: `${chartHeight}px`, width: `${chartWidth}px`, minWidth: '100%' }}>
        {/* Y-axis grid lines */}
        <div className="absolute inset-0">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={ratio}
              className="absolute w-full border-t border-gray-200 dark:border-gray-700"
              style={{ top: `${chartHeight - (ratio * chartHeight)}px` }}
            />
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 py-2">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div key={ratio} style={{ transform: `translateY(${-(ratio * 0.5 * 16)}px)` }}>
              ${Math.round(maxValue * ratio).toLocaleString()}
            </div>
          ))}
        </div>
        
        {/* Chart bars - Historical */}
        {historical.labels.map((label, i) => (
          <div 
            key={`historical-${i}`}
            className="absolute flex items-end justify-center"
            style={{ 
              left: `${i * (groupWidth + groupSpacing)}px`, 
              bottom: '0',
              height: `${chartHeight}px`,
              width: `${groupWidth}px`
            }}
          >
            {/* Income bar */}
            <div 
              className="mx-1"
              style={{
                width: `${barWidth}px`,
                height: `${(historical.income[i] / maxValue) * chartHeight}px`,
                backgroundColor: incomeColor
              }}
              title={`Income: $${historical.income[i].toLocaleString()}`}
            />
            
            {/* Expense bar */}
            <div 
              className="mx-1"
              style={{
                width: `${barWidth}px`,
                height: `${(historical.expenses[i] / maxValue) * chartHeight}px`,
                backgroundColor: expenseColor
              }}
              title={`Expenses: $${historical.expenses[i].toLocaleString()}`}
            />
            
            {/* Net Cash Flow bar */}
            <div 
              className="mx-1"
              style={{
                width: `${barWidth}px`,
                height: `${(historical.netCashFlow[i] / maxValue) * chartHeight}px`,
                backgroundColor: netColor
              }}
              title={`Net Cash Flow: $${historical.netCashFlow[i].toLocaleString()}`}
            />
            
            {/* X-axis label */}
            <div 
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ bottom: '-24px' }}
            >
              {label}
            </div>
          </div>
        ))}
        
        {/* Projection area */}
        {projected && (
          <div
            className="absolute right-0 h-full"
            style={{ 
              width: `${(projected.labels.length * (groupWidth + groupSpacing))}px`,
              backgroundColor: projectionBackground
            }}
          >
            <div className="absolute top-2 left-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Projected
            </div>
            
            {/* Projected bars */}
            {projected.labels.map((label, i) => (
              <div 
                key={`projected-${i}`}
                className="absolute flex items-end justify-center"
                style={{ 
                  left: `${i * (groupWidth + groupSpacing)}px`, 
                  bottom: '0',
                  height: `${chartHeight}px`,
                  width: `${groupWidth}px`
                }}
              >
                {/* Income bar */}
                <div 
                  className="mx-1"
                  style={{
                    width: `${barWidth}px`,
                    height: `${(projected.income[i] / maxValue) * chartHeight}px`,
                    backgroundColor: incomeColor,
                    opacity: 0.7
                  }}
                  title={`Projected Income: $${projected.income[i].toLocaleString()}`}
                />
                
                {/* Expense bar */}
                <div 
                  className="mx-1"
                  style={{
                    width: `${barWidth}px`,
                    height: `${(projected.expenses[i] / maxValue) * chartHeight}px`,
                    backgroundColor: expenseColor,
                    opacity: 0.7
                  }}
                  title={`Projected Expenses: $${projected.expenses[i].toLocaleString()}`}
                />
                
                {/* Net Cash Flow bar */}
                <div 
                  className="mx-1"
                  style={{
                    width: `${barWidth}px`,
                    height: `${(projected.netCashFlow[i] / maxValue) * chartHeight}px`,
                    backgroundColor: netColor,
                    opacity: 0.7
                  }}
                  title={`Projected Net Cash Flow: $${projected.netCashFlow[i].toLocaleString()}`}
                />
                
                {/* X-axis label */}
                <div 
                  className="absolute text-xs text-gray-500 dark:text-gray-400"
                  style={{ bottom: '-24px' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute top-2 right-2 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1" style={{ backgroundColor: incomeColor }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1" style={{ backgroundColor: expenseColor }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1" style={{ backgroundColor: netColor }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">Net Cash Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 