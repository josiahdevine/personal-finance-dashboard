import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

export const CategoryBreakdown: React.FC = () => {
  const { categoryData, loading } = useAnalytics();

  const chartData = {
    labels: categoryData?.map((c: CategoryData) => c.name) || [],
    datasets: [
      {
        data: categoryData?.map((c: CategoryData) => c.amount) || [],
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const totalSpent = categoryData?.reduce((sum: number, cat: CategoryData) => sum + cat.amount, 0) || 0;

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Spending by Category</h2>
          <span className="text-sm text-gray-600">
            Total: {formatCurrency(totalSpent)}
          </span>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <div className="h-64">
            <Doughnut data={chartData} options={options} />
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <div className="grid grid-cols-2 gap-4">
          {categoryData?.map((category: CategoryData) => (
            <div key={category.name} className="flex justify-between">
              <span className="text-sm text-gray-600">{category.name}</span>
              <span className="text-sm font-medium">
                {formatPercentage(category.percentage)}
              </span>
            </div>
          ))}
        </div>
      </Card.Footer>
    </Card>
  );
}; 