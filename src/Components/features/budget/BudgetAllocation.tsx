import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Skeleton } from '../../../components/common/Skeleton';
import { BudgetCategory } from './BudgetDashboard';

interface BudgetAllocationProps {
  categories: BudgetCategory[];
  totalBudget: number;
  onAllocationChange?: (updatedCategories: BudgetCategory[]) => void;
  isLoading?: boolean;
  className?: string;
}

export const BudgetAllocation: React.FC<BudgetAllocationProps> = ({
  categories,
  totalBudget,
  onAllocationChange,
  isLoading = false,
  className = '',
}) => {
  const [allocations, setAllocations] = useState<Record<string, number>>(
    categories?.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.amount }), {}) || {}
  );
  const [editMode, setEditMode] = useState(false);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate current total allocation
  const calculateTotalAllocated = () => {
    return Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  };
  
  // Calculate percentage of total budget
  const calculatePercentage = (amount: number) => {
    if (totalBudget === 0) return 0;
    return (amount / totalBudget) * 100;
  };
  
  // Handle allocation change for a category
  const handleAllocationChange = (categoryId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const newAllocations = { ...allocations, [categoryId]: numValue };
    setAllocations(newAllocations);
  };
  
  // Save allocation changes
  const handleSaveAllocations = () => {
    const totalAllocated = calculateTotalAllocated();
    
    if (totalAllocated > totalBudget) {
      // Alert user about over-allocation
      alert(`You've allocated $${totalAllocated - totalBudget} more than your total budget.`);
      return;
    }
    
    const updatedCategories = categories.map(cat => ({
      ...cat,
      amount: allocations[cat.id] || 0,
      remaining: allocations[cat.id] - cat.spent
    }));
    
    onAllocationChange?.(updatedCategories);
    setEditMode(false);
  };
  
  // Cancel allocation changes
  const handleCancelAllocations = () => {
    setAllocations(categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.amount }), {}));
    setEditMode(false);
  };
  
  // Calculate remaining unallocated budget
  const remainingUnallocated = totalBudget - calculateTotalAllocated();
  
  if (isLoading) {
    return (
      <Card className={`p-5 ${className}`}>
        <Skeleton className="h-7 w-56 mb-5" />
        
        <div className="mb-5 flex justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-2 w-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center">
              <div className="flex items-center flex-1">
                <Skeleton className="h-4 w-4 rounded-full mr-3" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (!categories || categories.length === 0) {
    return (
      <Card className={`p-5 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Budget Allocation</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No budget categories found. Create a budget to get started.
        </p>
      </Card>
    );
  }
  
  const totalAllocated = calculateTotalAllocated();
  const allocationPercentage = calculatePercentage(totalAllocated);
  
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budget Allocation</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
          >
            Adjust Budget
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancelAllocations}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAllocations}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
      
      {/* Budget allocation progress */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              remainingUnallocated < 0 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Allocated:</span>{' '}
            <span className="font-medium">{formatCurrency(totalAllocated)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Budget:</span>{' '}
            <span className="font-medium">{formatCurrency(totalBudget)}</span>
          </div>
        </div>
        <div className="mt-1 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Remaining Unallocated:</span>{' '}
          <span className={`font-medium ${remainingUnallocated < 0 ? 'text-red-500' : 'text-green-500'}`}>
            {formatCurrency(remainingUnallocated)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">
            ({(100 - allocationPercentage).toFixed(1)}%)
          </span>
        </div>
      </div>
      
      {/* Category allocations */}
      <div className="space-y-4 mt-6">
        {categories.map(category => (
          <div key={category.id} className="flex items-center">
            <div className="flex items-center flex-1">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              />
              <div className="font-medium">{category.name}</div>
            </div>
            
            {editMode ? (
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={allocations[category.id] || 0}
                  onChange={(e) => handleAllocationChange(category.id, e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-right"
                  min="0"
                  step="10"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <span className="font-medium">{formatCurrency(category.amount)}</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({calculatePercentage(category.amount).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add new category button */}
      {editMode && (
        <button
          className="mt-6 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      )}
      
      {/* Allocation suggestions */}
      {editMode && remainingUnallocated > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Suggestions</h3>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              You have {formatCurrency(remainingUnallocated)} unallocated. 
              Consider increasing your budget in these categories:
            </p>
            <ul className="list-disc ml-5 mt-2 text-blue-600 dark:text-blue-400">
              <li>Savings - to reach your financial goals faster</li>
              <li>Emergency Fund - aim for 3-6 months of expenses</li>
              <li>Debt Repayment - to reduce interest costs</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}; 