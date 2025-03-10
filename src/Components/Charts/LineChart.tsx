import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface LineChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}

export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

export interface LineChartProps {
  data: LineChartData;
  options?: Record<string, any>;
  height?: number;
  width?: number;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  options: _options,
  height,
  width,
  className = '',
}) => {
  const { isDarkMode } = useTheme();

  // In a real implementation, this would use a library like Chart.js or Recharts
  // For now, we'll implement a simple representation
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  
  // If no data or empty datasets, show a placeholder
  if (!data || !data.datasets || data.datasets.length === 0 || !data.labels || data.labels.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ height: height || '100%', width: width || '100%' }}
      >
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 ${className}`}
      style={{ height: height || '100%', width: width || '100%' }}
    >
      {/* Chart grid */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className="border-gray-200 dark:border-gray-800"
            style={{ borderRight: i % 4 !== 3 ? `1px solid ${gridColor}` : 'none', 
                    borderBottom: i < 12 ? `1px solid ${gridColor}` : 'none' }}
          />
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute top-0 left-0 h-full p-2 text-xs flex flex-col justify-between">
        <span style={{ color: textColor }}>High</span>
        <span style={{ color: textColor }}>Mid</span>
        <span style={{ color: textColor }}>Low</span>
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between text-xs">
        {data.labels.length > 0 && (
          <>
            <span style={{ color: textColor }}>{data.labels[0]}</span>
            {data.labels.length > 1 && (
              <span style={{ color: textColor }}>{data.labels[Math.floor(data.labels.length / 2)]}</span>
            )}
            <span style={{ color: textColor }}>{data.labels[data.labels.length - 1]}</span>
          </>
        )}
      </div>

      {/* Chart title and legend */}
      <div className="absolute top-0 right-0 p-2 text-xs">
        {data.datasets.map((dataset, i) => (
          <div key={i} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 mr-1 rounded-full" 
              style={{ backgroundColor: dataset.borderColor }}
            />
            <span style={{ color: textColor }}>{dataset.label}</span>
          </div>
        ))}
      </div>

      {/* This is a placeholder for the actual chart implementation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chart visualization would be rendered here with a chart library
        </p>
      </div>
    </div>
  );
}; 