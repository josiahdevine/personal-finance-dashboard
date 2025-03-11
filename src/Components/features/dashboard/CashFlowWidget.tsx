import React from 'react';
import Card from "../../../components/common/card_component/Card";
import Button from "../../../components/common/button/Button";
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export interface CashFlowDataPoint {
  date: Date;
  amount: number;
  isProjected?: boolean;
}

export interface CashFlowWidgetProps {
  data: CashFlowDataPoint[];
  projectedLow?: number;
  projectedHigh?: number;
  currentBalance: number;
  daysUntilLow?: number;
  isLoading?: boolean;
  onViewDetails?: () => void;
  timeframe?: '7d' | '30d' | '90d';
  className?: string;
}

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Get status color based on projected balance
const getStatusColor = (
  projectedLow: number | undefined,
  currentBalance: number,
  isDarkMode: boolean
): string => {
  if (!projectedLow) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
  
  if (projectedLow < 0) {
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  } else if (projectedLow < currentBalance * 0.3) {
    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
  } else {
    return isDarkMode ? 'text-green-400' : 'text-green-600';
  }
};

export const CashFlowWidget: React.FC<CashFlowWidgetProps> = ({
  data: _data = [],
  projectedLow,
  projectedHigh,
  currentBalance,
  daysUntilLow,
  isLoading = false,
  onViewDetails,
  timeframe = '30d',
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  
  // Status message based on projection
  const getStatusMessage = (): { message: string; icon: React.ReactNode; color: string } => {
    const statusColor = getStatusColor(projectedLow, currentBalance, isDarkMode);
    
    if (!projectedLow) {
      return {
        message: 'Insufficient data for prediction',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        color: statusColor
      };
    }
    
    if (projectedLow < 0) {
      return {
        message: `Potential overdraft in ${daysUntilLow} days`,
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        color: statusColor
      };
    } else if (projectedLow < currentBalance * 0.3) {
      return {
        message: `Low balance warning in ${daysUntilLow} days`,
        icon: <ArrowTrendingDownIcon className="h-5 w-5" />,
        color: statusColor
      };
    } else {
      return {
        message: 'Healthy cash flow projected',
        icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
        color: statusColor
      };
    }
  };

  const status = getStatusMessage();
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Cash Flow Forecast</h2>
        <div className="flex space-x-2">
          <Button 
            variant="text" 
            size="sm" 
            className={timeframe === '7d' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}
          >
            7D
          </Button>
          <Button 
            variant="text" 
            size="sm"
            className={timeframe === '30d' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}
          >
            30D
          </Button>
          <Button 
            variant="text" 
            size="sm"
            className={timeframe === '90d' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}
          >
            90D
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
              <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Projected Low</span>
              <div className="text-2xl font-bold">
                {projectedLow !== undefined ? formatCurrency(projectedLow) : '—'}
              </div>
            </div>
          </div>
          
          {/* Status Alert */}
          <div className={`flex items-center p-3 mb-4 rounded-lg bg-opacity-10 dark:bg-opacity-20 ${status.color.replace('text-', 'bg-')}`}>
            <span className={`mr-2 ${status.color}`}>{status.icon}</span>
            <span className="font-medium">{status.message}</span>
          </div>
          
          {/* Chart */}
          <div className="mt-4 h-48">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-full">
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Cash flow visualization</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Projection Details */}
        {projectedLow !== undefined && projectedHigh !== undefined && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
            <div className="mb-2 font-medium">Projection Summary</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Projected Low</div>
                <div className={`font-medium ${getStatusColor(projectedLow, currentBalance, isDarkMode)}`}>
                  {formatCurrency(projectedLow)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Projected High</div>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(projectedHigh)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
      
      {onViewDetails && (
        <Card.Footer className="text-center">
          <Button
            variant="text"
            size="sm"
            onClick={onViewDetails}
            rightIcon={<ChevronRightIcon className="h-4 w-4" />}
          >
            View Detailed Forecast
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}; 