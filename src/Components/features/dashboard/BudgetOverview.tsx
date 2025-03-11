import React from 'react';
import Card from "../../../components/common/card_component/Card";
import { ResponsiveContainer, ResponsiveGrid } from '../../../components/layout/ResponsiveContainer';
import Button from "../../../components/common/button/Button";
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export interface BudgetCategory {
  category: string;
  spent: number;
  budgeted: number;
  categoryIcon?: React.ReactNode;
}

export interface BudgetOverviewProps {
  budgets: BudgetCategory[];
  totalSpent: number;
  totalBudgeted: number;
  period: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper to calculate remaining days in current month
const getRemainingDays = (): number => {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDayOfMonth.getDate() - now.getDate();
};

// Helper to calculate percentage
const calculatePercentage = (spent: number, budgeted: number): number => {
  if (budgeted === 0) return 0;
  return Math.min(Math.round((spent / budgeted) * 100), 100);
};

// Helper to get progress bar color based on percentage
const getProgressColor = (percentage: number, isDarkMode: boolean): string => {
  if (percentage < 50) {
    return isDarkMode ? 'bg-green-500' : 'bg-green-500';
  } else if (percentage < 80) {
    return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
  } else {
    return isDarkMode ? 'bg-red-500' : 'bg-red-500';
  }
};

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets,
  totalSpent,
  totalBudgeted,
  period,
  isLoading = false,
  onViewDetails,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const remainingDays = getRemainingDays();
  const totalPercentage = calculatePercentage(totalSpent, totalBudgeted);
  const totalProgressColor = getProgressColor(totalPercentage, isDarkMode);
  const remaining = totalBudgeted - totalSpent;
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Budget Overview</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">{period}</div>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer>
          {/* Total Budget Summary */}
          <div className="mb-8">
            <div className="flex justify-between mb-1">
              <h3 className="font-medium">Total Budget</h3>
              <div className="text-right">
                <span className="font-medium">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({totalPercentage}%)
                </span>
              </div>
            </div>
            
            {/* Total Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full ${totalProgressColor}`}
                style={{ width: `${totalPercentage}%` }}
              ></div>
            </div>
            
            {/* Remaining Amount & Days */}
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <div>
                Remaining: <span className="font-medium">{formatCurrency(remaining)}</span>
              </div>
              <div>
                {remainingDays} days left in period
              </div>
            </div>
          </div>
          
          {/* Budget Categories */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Categories</h3>
            <ResponsiveGrid
              columns={{ base: 1, md: 2 }}
              gap="6"
            >
              {budgets.map((budget) => {
                const percentage = calculatePercentage(budget.spent, budget.budgeted);
                const progressColor = getProgressColor(percentage, isDarkMode);
                return (
                  <div key={budget.category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {budget.categoryIcon && (
                          <span className="mr-2">{budget.categoryIcon}</span>
                        )}
                        <span className="font-medium">{budget.category}</span>
                      </div>
                      <div className="text-sm">
                        <span className={
                          percentage >= 100
                            ? 'text-red-600 dark:text-red-400'
                            : percentage >= 80
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : ''
                        }>
                          {formatCurrency(budget.spent)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {' / '}{formatCurrency(budget.budgeted)}
                        </span>
                      </div>
                    </div>
                    {/* Category Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${progressColor}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </ResponsiveGrid>
          </div>
          
          {/* View Details Button */}
          {onViewDetails && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewDetails}
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                View All Budgets
              </Button>
            </div>
          )}
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}; 