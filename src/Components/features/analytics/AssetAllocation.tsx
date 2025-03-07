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
  const { analyticsData: _analyticsData, loadingAnalytics } = useAnalytics();
  
  // Mock asset data for now
  const assetData: AssetData[] = [
    { type: 'Stocks', value: 45000, color: '#4F46E5' },
    { type: 'Bonds', value: 20000, color: '#10B981' },
    { type: 'Cash', value: 15000, color: '#F59E0B' },
    { type: 'Real Estate', value: 30000, color: '#EF4444' }
  ];

  const chartData = {
    labels: assetData.map((a) => a.type),
    datasets: [{
      data: assetData.map((a) => a.value),
      backgroundColor: assetData.map((a) => a.color),
      borderWidth: 0
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

  const totalValue = assetData.reduce((sum: number, asset: AssetData) => sum + asset.value, 0);

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
        {loadingAnalytics ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <div className="h-64">
            <Pie data={chartData} options={options} />
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <div className="grid grid-cols-2 gap-4">
          {assetData.map((asset: AssetData) => (
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