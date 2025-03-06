import React from 'react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { LineChart } from '../../charts/LineChart';
import { formatCurrency } from '../../../utils/formatters';

export const PerformanceChart: React.FC = () => {
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
        <p className="text-red-500">Error loading performance data</p>
      </div>
    );
  }

  const performanceData = portfolio?.performance.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    value: point.value,
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Performance History</h2>
      <div className="h-64">
        <LineChart
          data={performanceData}
          xKey="date"
          yKey="value"
          yFormatter={formatCurrency}
        />
      </div>
    </div>
  );
}; 