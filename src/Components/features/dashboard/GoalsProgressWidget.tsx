import React from 'react';
import Card from "../../../components/common/card_component/Card";
import Button from "../../../components/common/button/Button";
import { ResponsiveContainer, ResponsiveGrid } from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  PlusIcon,
  ChevronRightIcon,
  FlagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'other';
  priority: 'high' | 'medium' | 'low';
  isCompleted?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

export interface GoalsProgressWidgetProps {
  goals: FinancialGoal[];
  isLoading?: boolean;
  onGoalClick?: (goal: FinancialGoal) => void;
  onAddGoal?: () => void;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to calculate percentage
const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  const percentage = Math.round((current / target) * 100);
  return Math.min(percentage, 100); // Cap at 100%
};

// Helper to calculate time remaining
const calculateTimeRemaining = (targetDate: Date): string => {
  const now = new Date();
  
  if (targetDate.getTime() < now.getTime()) {
    return 'Past due';
  }
  
  const diffTime = Math.abs(targetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} left`;
  }
  
  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  
  return remainingMonths > 0 
    ? `${diffYears} year${diffYears !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} left`
    : `${diffYears} year${diffYears !== 1 ? 's' : ''} left`;
};

// Helper to determine progress bar color
const getProgressColor = (percentage: number, isDarkMode: boolean): string => {
  if (percentage >= 100) {
    return isDarkMode ? 'bg-green-500' : 'bg-green-500';
  } else if (percentage >= 66) {
    return isDarkMode ? 'bg-blue-500' : 'bg-blue-500';
  } else if (percentage >= 33) {
    return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
  } else {
    return isDarkMode ? 'bg-red-500' : 'bg-red-500';
  }
};

export const GoalsProgressWidget: React.FC<GoalsProgressWidgetProps> = ({
  goals = [],
  isLoading = false,
  onGoalClick,
  onAddGoal,
  onViewAll,
  maxItems = 3,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const displayGoals = goals.slice(0, maxItems);
  
  // Count completed goals
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const completionPercentage = goals.length > 0 
    ? Math.round((completedGoals / goals.length) * 100) 
    : 0;
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Empty state
  if (displayGoals.length === 0) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <h2 className="text-xl font-semibold">Financial Goals</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FlagIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No financial goals yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Set goals to keep track of your financial progress
            </p>
            {onAddGoal && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddGoal}
                leftIcon={<PlusIcon className="h-4 w-4" />}
              >
                Add Your First Goal
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Financial Goals</h2>
        {onAddGoal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddGoal}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Goal
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer>
          {/* Summary Section */}
          <div className="mb-6">
            <ResponsiveGrid
              columns={{ base: 2, md: 2 }}
              gap="4"
              className="mb-4"
            >
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Goals</div>
                <div className="text-2xl font-bold">{goals.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Goals Completed</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedGoals}</div>
              </div>
            </ResponsiveGrid>
            
            {/* Overall Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Completion</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-green-500" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Goals List */}
          <div className="space-y-5">
            {displayGoals.map((goal) => {
              const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
              const progressColor = getProgressColor(percentage, isDarkMode);
              const timeRemaining = calculateTimeRemaining(goal.targetDate);
              
              return (
                <div 
                  key={goal.id}
                  className={`
                    ${onGoalClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                    rounded-lg transition-colors duration-150
                  `}
                  onClick={() => onGoalClick && onGoalClick(goal)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium flex items-center">
                      {goal.icon || <FlagIcon className="h-4 w-4 mr-1.5 text-blue-500" />}
                      <span>
                        {goal.name}
                        {goal.isCompleted && (
                          <CheckCircleIcon className="h-4 w-4 ml-1.5 text-green-500 inline" />
                        )}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(goal.currentAmount)}
                      <span className="text-gray-500 dark:text-gray-400 font-normal">
                        {' / '}{formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                    <div 
                      className={`h-1.5 rounded-full ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Time Remaining */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-500 dark:text-gray-400">{timeRemaining}</div>
                    <div className="font-medium">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* View All Button */}
          {onViewAll && goals.length > maxItems && (
            <div className="mt-6 text-center">
              <Button
                variant="text"
                size="sm"
                onClick={onViewAll}
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                View All Goals
              </Button>
            </div>
          )}
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}; 