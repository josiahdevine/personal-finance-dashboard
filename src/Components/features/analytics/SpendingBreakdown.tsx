import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
// import { usePlaid } from '../../../contexts/PlaidContext';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

interface CategoryTotal {
  [key: string]: number;
}

// Mock implementation of usePlaid
const usePlaid = () => {
  return {
    transactions: [
      { id: '1', amount: 45.99, category: ['Food and Drink'] },
      { id: '2', amount: 125.00, category: ['Housing'] },
      { id: '3', amount: 35.50, category: ['Transportation'] },
      { id: '4', amount: 75.25, category: ['Entertainment'] },
      { id: '5', amount: 200.00, category: ['Housing'] },
      { id: '6', amount: 55.75, category: ['Food and Drink'] },
      { id: '7', amount: 30.00, category: ['Transportation'] },
      { id: '8', amount: 120.50, category: ['Shopping'] }
    ]
  };
};

export const SpendingBreakdown: React.FC = () => {
  const { transactions } = usePlaid();

  const categoryTotals = useMemo(() => {
    return transactions?.reduce((acc: CategoryTotal, transaction) => {
      const category = transaction.category?.[0] || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {}) || {};
  }, [transactions]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [categoryTotals]);

  const chartData = {
    labels: sortedCategories.map(([category]) => category),
    datasets: [
      {
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
          '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4'
        ],
        borderWidth: 1
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Spending Breakdown</h2>
          <span className="text-sm text-gray-600">
            Total: {formatCurrency(totalSpent)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!transactions ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <div className="h-64">
            <Doughnut data={chartData} options={options} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col">
        <div className="grid grid-cols-2 gap-4 w-full">
          {sortedCategories.map(([category, amount]) => (
            <div key={category} className="flex justify-between">
              <span className="text-sm text-gray-600">{category}</span>
              <span className="text-sm font-medium">
                {((amount / totalSpent) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}; 