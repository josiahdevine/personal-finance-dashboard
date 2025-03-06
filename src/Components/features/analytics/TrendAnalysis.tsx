import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

interface TrendData {
  labels: string[];
  income: number[];
  expenses: number[];
  savings: number[];
}

export const TrendAnalysis: React.FC = () => {
  const { trendData, loading } = useAnalytics();

  const chartData = {
    labels: trendData?.labels || [],
    datasets: [
      {
        label: 'Income',
        data: trendData?.income || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: trendData?.expenses || [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Savings',
        data: trendData?.savings || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          }
        }
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-medium">Financial Trends</h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <Line data={chartData} options={options} height={64} />
        )}
      </Card.Body>
    </Card>
  );
}; 