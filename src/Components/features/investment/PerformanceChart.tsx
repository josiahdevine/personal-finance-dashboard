import React from 'react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { LineChart, LineChartData } from '../../../components/common/charts';
import Widget from '../../../components/common/widget/Widget';

interface PerformanceChartProps {
  isLoading?: boolean;
  period?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  isLoading: externalLoading,
  period: _period = '1m'
}) => {
  const { portfolio, loading: internalLoading, error } = usePortfolio();
  
  // Use external loading state if provided, otherwise use internal loading state
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  if (isLoading) {
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

  // Transform the data to match the LineChart expected format
  const rawPerformanceData = portfolio?.performance || [];
  
  // Extract dates for labels
  const labels = rawPerformanceData.map(point => 
    new Date(point.date).toLocaleDateString()
  );
  
  // Extract values for dataset
  const values = rawPerformanceData.map(point => point.value);
  
  // Create the LineChartData object
  const chartData: LineChartData = {
    labels,
    datasets: [
      {
        label: 'Performance',
        data: values,
        borderColor: '#34D399',
        backgroundColor: '#A7F3D0',
        fill: true,
      },
    ],
  };

  return (
    <Widget title="Performance">
      <LineChart data={chartData} />
    </Widget>
  );
}; 