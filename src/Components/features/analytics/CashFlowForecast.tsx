import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

interface Projection {
  date: string;
  amount: number;
}

export const CashFlowForecast: React.FC = () => {
  const { predictions, loading } = useAnalytics();

  const chartData = {
    labels: predictions?.netWorthProjections?.map((p: Projection) => p.date) || [],
    datasets: [
      {
        label: 'Projected Net Worth',
        data: predictions?.netWorthProjections?.map((p: Projection) => p.amount) || [],
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
        <h2 className="text-lg font-medium">Cash Flow Forecast</h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 