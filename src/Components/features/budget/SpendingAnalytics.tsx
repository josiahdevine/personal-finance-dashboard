import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Skeleton } from '../../../components/common/Skeleton';
import { BudgetCategory } from './BudgetDashboard';

// Define time period types
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

// Define data point for spending trends
interface SpendingDataPoint {
  date: string;
  amount: number;
}

// Define trend data by category
interface CategoryTrend {
  categoryId: string;
  name: string;
  color: string;
  data: SpendingDataPoint[];
}

interface SpendingAnalyticsProps {
  categories: BudgetCategory[];
  trendData: CategoryTrend[];
  isLoading?: boolean;
  className?: string;
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({
  categories,
  trendData,
  isLoading = false,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories?.slice(0, 3).map(cat => cat.id) || []
  );
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date based on selected period
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    switch (selectedPeriod) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString('en-US', { day: 'numeric' });
      case 'quarter':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  // Filter trends data based on selected categories and period
  const getFilteredTrends = () => {
    if (!trendData) return [];
    
    return trendData
      .filter(trend => selectedCategories.includes(trend.categoryId))
      .map(trend => {
        // Return with filtered data points based on period
        // This is a simplified example - you'd need proper date filtering logic
        return {
          ...trend,
          data: trend.data.slice(-getDataPointCount())
        };
      });
  };
  
  // Determine how many data points to show based on period
  const getDataPointCount = () => {
    switch (selectedPeriod) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 13;
      case 'year': return 12;
      default: return 30;
    }
  };
  
  // Calculate total spending for the selected period
  const calculateTotalSpending = () => {
    const filteredTrends = getFilteredTrends();
    
    let total = 0;
    filteredTrends.forEach(trend => {
      trend.data.forEach(point => {
        total += point.amount;
      });
    });
    
    return total;
  };
  
  // Find category with highest spending
  const getHighestSpendingCategory = () => {
    const filteredTrends = getFilteredTrends();
    
    if (filteredTrends.length === 0) return null;
    
    const categoryTotals = filteredTrends.map(trend => {
      const total = trend.data.reduce((sum, point) => sum + point.amount, 0);
      return { id: trend.categoryId, name: trend.name, total, color: trend.color };
    });
    
    return categoryTotals.sort((a, b) => b.total - a.total)[0];
  };
  
  // Get date labels for x-axis
  const getDateLabels = () => {
    if (!trendData || trendData.length === 0 || !trendData[0].data) return [];
    
    const firstTrend = trendData[0];
    return firstTrend.data.slice(-getDataPointCount()).map(point => formatDate(point.date));
  };
  
  // Get max value for y-axis scaling
  const getMaxValue = () => {
    const filteredTrends = getFilteredTrends();
    
    if (filteredTrends.length === 0) return 1000;
    
    let max = 0;
    filteredTrends.forEach(trend => {
      trend.data.forEach(point => {
        if (point.amount > max) max = point.amount;
      });
    });
    
    // Round up to the next nice number for a clean chart scale
    return Math.ceil(max / 100) * 100;
  };
  
  if (isLoading) {
    return (
      <Card className={`p-5 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        
        <Skeleton className="h-60 w-full mb-6" />
        
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </Card>
    );
  }
  
  if (!categories || categories.length === 0 || !trendData || trendData.length === 0) {
    return (
      <Card className={`p-5 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Spending Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No spending data available. Start tracking your expenses to see analytics.
        </p>
      </Card>
    );
  }
  
  const dateLabels = getDateLabels();
  const maxValue = getMaxValue();
  const filteredTrends = getFilteredTrends();
  const totalSpending = calculateTotalSpending();
  const highestCategory = getHighestSpendingCategory();
  
  // Calculate chart dimensions
  const chartHeight = 250;
  const chartWidth = "100%";
  const paddingBottom = 30; // For x-axis labels
  const paddingLeft = 60; // For y-axis labels
  const paddingTop = 20;
  const paddingRight = 20;
  const chartInnerHeight = chartHeight - paddingTop - paddingBottom;
  
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-xl font-semibold">Spending Analytics</h2>
        
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spending</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalSpending)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedPeriod === 'week' ? 'This week' : 
             selectedPeriod === 'month' ? 'This month' : 
             selectedPeriod === 'quarter' ? 'This quarter' : 'This year'}
          </div>
        </div>
        
        {highestCategory && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Highest Spending</div>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: highestCategory.color }}
              />
              <div className="text-2xl font-semibold">{highestCategory.name}</div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(highestCategory.total)} ({Math.round((highestCategory.total / totalSpending) * 100)}%)
            </div>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="relative h-64 mb-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pt-5 pb-8">
          <div>{formatCurrency(maxValue)}</div>
          <div>{formatCurrency(maxValue * 0.75)}</div>
          <div>{formatCurrency(maxValue * 0.5)}</div>
          <div>{formatCurrency(maxValue * 0.25)}</div>
          <div>$0</div>
        </div>
        
        {/* Y-axis grid lines */}
        <div className="absolute left-12 right-0 top-0 bottom-0 pt-5 pb-8">
          <div className="relative h-full">
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700" style={{ top: '0%' }}></div>
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700" style={{ top: '25%' }}></div>
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700" style={{ top: '50%' }}></div>
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700" style={{ top: '75%' }}></div>
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700" style={{ top: '100%' }}></div>
          </div>
        </div>
        
        {/* Chart area */}
        <svg 
          width={chartWidth} 
          height={chartHeight}
          className="absolute top-0 left-0"
          style={{ paddingTop, paddingRight, paddingBottom, paddingLeft }}
        >
          {/* Chart placeholder - in a real app, you'd use a charting library like Chart.js, Recharts, etc. */}
          {filteredTrends.map((trend, _trendIndex) => {
            const dataPoints = trend.data.map((point, index) => {
              const x = paddingLeft + (index / (trend.data.length - 1)) * (100 - paddingLeft - paddingRight) + '%';
              const y = paddingTop + chartInnerHeight - (point.amount / maxValue * chartInnerHeight);
              return { x, y, value: point.amount };
            });
            
            // Generate path for the line
            let pathD = '';
            dataPoints.forEach((point, index) => {
              if (index === 0) {
                pathD += `M ${point.x} ${point.y}`;
              } else {
                pathD += ` L ${point.x} ${point.y}`;
              }
            });
            
            return (
              <g key={trend.categoryId}>
                {/* Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={trend.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {dataPoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={trend.color}
                  />
                ))}
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {dateLabels.map((label, index) => (
            <div key={index} className={index === 0 || index === dateLabels.length - 1 ? '' : 'hidden sm:block'}>
              {label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
              selectedCategories.includes(category.id)
                ? 'bg-opacity-15 border-2'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            style={{ 
              backgroundColor: selectedCategories.includes(category.id) 
                ? `${category.color}30` 
                : '',
              borderColor: selectedCategories.includes(category.id) 
                ? category.color 
                : 'transparent',
              color: selectedCategories.includes(category.id) 
                ? category.color 
                : ''
            }}
            onClick={() => toggleCategory(category.id)}
          >
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </button>
        ))}
      </div>
    </Card>
  );
}; 