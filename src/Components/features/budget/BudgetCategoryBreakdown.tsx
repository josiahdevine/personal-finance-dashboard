import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Card } from '../../../components/common/Card';
import { Skeleton } from '../../../components/common/Skeleton';
import { BudgetCategory } from './BudgetDashboard';

interface BudgetCategoryBreakdownProps {
  categories: BudgetCategory[];
  isLoading?: boolean;
  className?: string;
}

type SortOrder = 'amount-desc' | 'amount-asc' | 'spent-desc' | 'spent-asc' | 'remaining-desc' | 'remaining-asc' | 'name';

export const BudgetCategoryBreakdown: React.FC<BudgetCategoryBreakdownProps> = ({
  categories,
  isLoading = false,
  className = '',
}) => {
  const { isDarkMode: _isDarkMode } = useTheme();
  const [sortOrder, setSortOrder] = useState<SortOrder>('amount-desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate percentage spent of budget
  const calculatePercentage = (spent: number, total: number) => {
    if (total === 0) return 0;
    return (spent / total) * 100;
  };
  
  // Sort categories based on selected sort order
  const sortCategories = (cats: BudgetCategory[]) => {
    if (!cats) return [];
    
    const clonedCats = [...cats];
    
    switch (sortOrder) {
      case 'amount-desc':
        return clonedCats.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return clonedCats.sort((a, b) => a.amount - b.amount);
      case 'spent-desc':
        return clonedCats.sort((a, b) => b.spent - a.spent);
      case 'spent-asc':
        return clonedCats.sort((a, b) => a.spent - b.spent);
      case 'remaining-desc':
        return clonedCats.sort((a, b) => b.remaining - a.remaining);
      case 'remaining-asc':
        return clonedCats.sort((a, b) => a.remaining - b.remaining);
      case 'name':
        return clonedCats.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return clonedCats;
    }
  };
  
  // Get color class based on percentage spent
  const getHealthColorClass = (spent: number, total: number) => {
    const percentage = calculatePercentage(spent, total);
    
    if (percentage >= 100) return 'text-red-500 dark:text-red-400';
    if (percentage >= 90) return 'text-amber-500 dark:text-amber-400';
    if (percentage >= 75) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };
  
  // Handle sort change
  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
  };
  
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };
  
  if (isLoading) {
    return (
      <Card className={`p-5 ${className}`}>
        <Skeleton className="h-7 w-56 mb-5" />
        
        <div className="mb-5 flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 rounded-full mr-3" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (!categories || categories.length === 0) {
    return (
      <Card className={`p-5 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Budget Categories</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No budget categories found. Create a budget to get started.
        </p>
      </Card>
    );
  }
  
  const sortedCategories = sortCategories(categories);
  
  // Calculate totals
  const totalBudget = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = categories.reduce((sum, cat) => sum + cat.remaining, 0);
  
  return (
    <Card className={`p-5 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Budget Categories</h2>
      
      {/* Filtering and sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Budget:</span>{' '}
          <span className="font-medium">{formatCurrency(totalBudget)}</span>{' '}
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-500 dark:text-gray-400">Spent:</span>{' '}
          <span className="font-medium">{formatCurrency(totalSpent)}</span>{' '}
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-500 dark:text-gray-400">Remaining:</span>{' '}
          <span className={`font-medium ${getHealthColorClass(totalSpent, totalBudget)}`}>
            {formatCurrency(totalRemaining)}
          </span>
        </div>
        
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value as SortOrder)}
          >
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="spent-desc">Spent (High to Low)</option>
            <option value="spent-asc">Spent (Low to High)</option>
            <option value="remaining-desc">Remaining (High to Low)</option>
            <option value="remaining-asc">Remaining (Low to High)</option>
            <option value="name">Name (A to Z)</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Categories list */}
      <div className="space-y-4">
        {sortedCategories.map(category => {
          const percentSpent = calculatePercentage(category.spent, category.amount);
          const isSelected = selectedCategory === category.id;
          
          return (
            <div 
              key={category.id}
              className={`border-b border-gray-200 dark:border-gray-700 pb-4 ${
                isSelected ? 'bg-gray-50 dark:bg-gray-800' : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="flex justify-between items-center mb-2 cursor-pointer">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <div className="font-medium">
                  {formatCurrency(category.amount)}
                </div>
              </div>
              
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full transition-all"
                  style={{ 
                    width: `${Math.min(percentSpent, 100)}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Spent:</span>{' '}
                  <span className="font-medium">{formatCurrency(category.spent)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Remaining:</span>{' '}
                  <span className={`font-medium ${getHealthColorClass(category.spent, category.amount)}`}>
                    {formatCurrency(category.remaining)}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({percentSpent.toFixed(0)}%)
                  </span>
                </div>
              </div>
              
              {/* Expanded details when selected */}
              {isSelected && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                    <div className="text-sm font-medium">{percentSpent.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Daily Budget:</span>
                      <span className="font-medium">{formatCurrency(category.amount / 30)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Daily Average:</span>
                      <span className="font-medium">{formatCurrency(category.spent / 15)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-3 flex space-x-2">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View Transactions
                    </button>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Edit Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}; 