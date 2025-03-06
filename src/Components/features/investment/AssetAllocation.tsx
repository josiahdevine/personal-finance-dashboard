import React from 'react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { PieChart } from '../../charts/PieChart';
import { formatPercentage } from '../../../utils/formatters';

export const AssetAllocation: React.FC = () => {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-500">Error loading asset allocation data</p>
      </div>
    );
  }

  const assetAllocationData = portfolio?.assetAllocation.map(asset => ({
    name: asset.type,
    value: asset.percentage,
    color: asset.color,
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
      <div className="h-64">
        <PieChart data={assetAllocationData} />
      </div>
      <div className="mt-4 space-y-2">
        {assetAllocationData.map((asset) => (
          <div key={asset.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: asset.color }}
              ></div>
              <span className="text-sm text-gray-600">{asset.name}</span>
            </div>
            <span className="text-sm font-medium">
              {formatPercentage(asset.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}; 