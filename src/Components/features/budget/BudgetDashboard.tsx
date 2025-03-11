import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import Card from "../../../components/common/Card";
import { ResponsiveGrid } from '../../../components/common/ResponsiveGrid';
import { PeriodSelector } from '../../features/investment/PeriodSelector';
import { Skeleton } from '../../../components/common/Skeleton';
import { TimePeriod } from '../../features/investment/PeriodSelector';

// Types for budget data
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
  startDate: string;
  endDate: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  color: string;
  icon?: string;
}

export interface BudgetDashboardProps {
  budgetId?: string;
  period?: TimePeriod;
  isLoading?: boolean;
  onPeriodChange?: (period: TimePeriod) => void;
  className?: string;
}

// Sample data for demonstration
const sampleBudgets: Budget[] = [
  {
    id: 'budget-1',
    name: 'Monthly Budget',
    amount: 3500,
    spent: 2100,
    remaining: 1400,
    startDate: '2023-08-01',
    endDate: '2023-08-31',
    categories: [
      {
        id: 'cat-1',
        name: 'Housing',
        amount: 1200,
        spent: 1200,
        remaining: 0,
        color: '#4f46e5',
      },
      {
        id: 'cat-2',
        name: 'Food',
        amount: 600,
        spent: 450,
        remaining: 150,
        color: '#10b981',
      },
      {
        id: 'cat-3',
        name: 'Transportation',
        amount: 300,
        spent: 200,
        remaining: 100,
        color: '#f59e0b',
      },
      {
        id: 'cat-4',
        name: 'Utilities',
        amount: 200,
        spent: 150,
        remaining: 50,
        color: '#6366f1',
      },
      {
        id: 'cat-5',
        name: 'Entertainment',
        amount: 300,
        spent: 100,
        remaining: 200,
        color: '#ec4899',
      },
      {
        id: 'cat-6',
        name: 'Shopping',
        amount: 400,
        spent: 0,
        remaining: 400,
        color: '#14b8a6',
      },
      {
        id: 'cat-7',
        name: 'Health',
        amount: 200,
        spent: 0,
        remaining: 200,
        color: '#8b5cf6',
      },
      {
        id: 'cat-8',
        name: 'Miscellaneous',
        amount: 300,
        spent: 0,
        remaining: 300,
        color: '#a3a3a3',
      },
    ],
  },
];

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  budgetId,
  period = '1m',
  isLoading = false,
  onPeriodChange,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(period);
  
  // In a real app, we would fetch the budget data based on the budgetId
  const budget = sampleBudgets[0];
  
  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setActivePeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate percentage of budget spent
  const calculatePercentage = (spent: number, total: number) => {
    if (total === 0) return 0;
    return (spent / total) * 100;
  };
  
  // Get color based on budget health (percentage spent)
  const getBudgetHealthColor = (spent: number, total: number) => {
    const percentage = calculatePercentage(spent, total);
    
    if (percentage > 100) return 'bg-red-500 dark:bg-red-600';
    if (percentage > 90) return 'bg-amber-500 dark:bg-amber-600';
    if (percentage > 75) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-emerald-500 dark:bg-emerald-600';
  };
  
  // Budget summary component
  const BudgetSummary = () => {
    if (isLoading) {
      return (
        <Card className="p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </Card>
      );
    }
    
    if (!budget) {
      return (
        <Card className="p-5">
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No budget data available</p>
        </Card>
      );
    }
    
    const percentSpent = calculatePercentage(budget.spent, budget.amount);
    const healthColor = getBudgetHealthColor(budget.spent, budget.amount);
    
    return (
      <Card className="p-5">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">{budget.name}</h3>
        <div className="text-2xl font-bold mb-4">{formatCurrency(budget.amount)}</div>
        
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full ${healthColor}`} 
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Spent: </span>
            <span className="font-medium">{formatCurrency(budget.spent)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
            <span className="font-medium">{formatCurrency(budget.remaining)}</span>
          </div>
        </div>
      </Card>
    );
  };
  
  // Category breakdown component
  const CategoryBreakdown = () => {
    if (isLoading) {
      return (
        <Card className="p-5">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-3 w-3 rounded-full mr-3" />
                <Skeleton className="h-4 w-32 mr-auto" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      );
    }
    
    if (!budget || budget.categories.length === 0) {
      return (
        <Card className="p-5">
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No categories available</p>
        </Card>
      );
    }
    
    // Sort categories by amount (highest first)
    const sortedCategories = [...budget.categories].sort((a, b) => b.amount - a.amount);
    
    return (
      <Card className="p-5">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Budget Breakdown</h3>
        
        <div className="space-y-4">
          {sortedCategories.map(category => {
            const percentSpent = calculatePercentage(category.spent, category.amount);
            
            return (
              <div key={category.id} className="group">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(category.spent)}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full group-hover:opacity-80 transition-opacity"
                    style={{ 
                      width: `${Math.min(percentSpent, 100)}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };
  
  // Spending trends component
  const SpendingTrends = () => {
    if (isLoading) {
      return (
        <Card className="p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-48 w-full" />
        </Card>
      );
    }
    
    return (
      <Card className="p-5">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Spending Trends</h3>
        <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart will be implemented with actual chart library</p>
        </div>
      </Card>
    );
  };
  
  // Recent transactions component
  const RecentTransactions = () => {
    if (isLoading) {
      return (
        <Card className="p-5">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      );
    }
    
    // Placeholder for recent transactions
    // In a real implementation, this would show actual transaction data
    return (
      <Card className="p-5">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {[
            { id: 'tx1', name: 'Grocery Store', category: 'Food', amount: 82.45, date: '2023-08-15' },
            { id: 'tx2', name: 'Electric Bill', category: 'Utilities', amount: 65.00, date: '2023-08-12' },
            { id: 'tx3', name: 'Gas Station', category: 'Transportation', amount: 45.50, date: '2023-08-10' },
            { id: 'tx4', name: 'Restaurant', category: 'Food', amount: 35.75, date: '2023-08-08' },
          ].map(transaction => (
            <div key={transaction.id} className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                  {transaction.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{transaction.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</div>
              </div>
              <div className="font-medium text-right">
                -{formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
          
          <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline w-full text-center mt-2">
            View All Transactions
          </button>
        </div>
      </Card>
    );
  };
  
  // Budget tips component
  const BudgetTips = () => {
    if (isLoading) {
      return (
        <Card className="p-5">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      );
    }
    
    return (
      <Card className="p-5">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Budget Tips</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You're spending more on food this month compared to your average. Consider meal planning to reduce expenses.
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              Great job staying under your entertainment budget this month! You've saved 67% compared to last month.
            </p>
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Budget Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Track your spending and stay on budget
          </p>
        </div>
        <PeriodSelector
          activePeriod={activePeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>
      
      {/* Budget summary */}
      <BudgetSummary />
      
      {/* Main content grid */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={6}>
        <CategoryBreakdown />
        <SpendingTrends />
      </ResponsiveGrid>
      
      <ResponsiveGrid columns={{ sm: 1, lg: 3 }} gap={6}>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <BudgetTips />
      </ResponsiveGrid>
    </div>
  );
}; 