import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

interface AssetData {
  type: string;
  value: number;
  color: string;
}

export const AssetAllocation: React.FC = () => {
  const { assetData, loading } = useAnalytics();

  const chartData = {
    labels: assetData?.map((a: AssetData) => a.type) || [],
    datasets: [{
      data: assetData?.map((a: AssetData) => a.value) || [],
      backgroundColor: [
        '#3B82F6', // Cash
        '#10B981', // Stocks
        '#F59E0B', // Bonds
        '#6366F1', // Real Estate
        '#EC4899', // Crypto
        '#8B5CF6', // Commodities
      ],
      borderWidth: 1
    }]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
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
    }
  };

  const totalValue = assetData?.reduce((sum: number, asset: AssetData) => sum + asset.value, 0) || 0;

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Asset Allocation</h2>
          <span className="text-sm text-gray-600">
            Total: {formatCurrency(totalValue)}
          </span>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <div className="h-64">
            <Pie data={chartData} options={options} />
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <div className="grid grid-cols-2 gap-4">
          {assetData?.map((asset: AssetData) => (
            <div key={asset.type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-${asset.color}-500`}></div>
              <span className="text-sm text-gray-600">{asset.type}</span>
              <span className="text-sm font-medium">
                {formatPercentage((asset.value / totalValue) * 100)}
              </span>
            </div>
          ))}
        </div>
      </Card.Footer>
    </Card>
  );
}; 