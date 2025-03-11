import React, { useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface BalanceHistoryDataPoint {
  date: Date | string;
  amount: number;
}

interface BalanceHistoryChartProps {
  data: BalanceHistoryDataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
  gradientColor?: string;
  lineColor?: string;
  timeFormat?: 'day' | 'month' | 'year';
}

export const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  data,
  title = 'Balance History',
  height = 300,
  showLegend = true,
  className = '',
  gradientColor = 'rgba(59, 130, 246, 0.2)', // Default blue with alpha
  lineColor = 'rgb(59, 130, 246)', // Default blue
  timeFormat = 'month',
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme.isDark;

  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (timeFormat) {
      case 'day':
        return dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      case 'year':
        return dateObj.toLocaleDateString(undefined, { year: 'numeric' });
      case 'month':
      default:
        return dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
  }, [timeFormat]);

  // Process data for the chart
  const { labels, values } = useMemo(() => {
    const sortedData = [...(data || [])].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return {
      labels: sortedData.map(item => formatDate(item.date)),
      values: sortedData.map(item => item.amount)
    };
  }, [data, formatDate]);

  const chartData = useMemo((): ChartData<'line'> => {
    return {
      labels,
      datasets: [
        {
          label: 'Balance',
          data: values,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            
            if (!chartArea) {
              return gradientColor;
            }
            
            const gradient = ctx.createLinearGradient(
              0, chartArea.top, 0, chartArea.bottom
            );
            gradient.addColorStop(0, gradientColor);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            return gradient;
          },
          borderColor: lineColor,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: lineColor,
          pointBorderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pointHoverRadius: 5,
        },
      ],
    };
  }, [labels, values, gradientColor, lineColor, isDarkMode]);

  const chartOptions = useMemo((): ChartOptions<'line'> => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151',
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          color: isDarkMode ? '#E5E7EB' : '#374151',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Inter', sans-serif",
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#E5E7EB' : '#1F2937',
          bodyColor: isDarkMode ? '#E5E7EB' : '#1F2937',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `${context.dataset.label}: ${formatCurrency(value, 'USD')}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            tickLength: 0,
          },
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          grid: {
            display: true,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            font: {
              family: "'Inter', sans-serif",
            },
            callback: function(value) {
              return formatCurrency(value, 'USD');
            },
          },
          beginAtZero: false,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        line: {
          borderWidth: 2,
        },
      },
    };
  }, [title, showLegend, isDarkMode]);

  // If there's no data, show a message instead of the chart
  if (!data || data.length === 0) {
    return (
      <div 
        className={`w-full flex items-center justify-center ${className}`} 
        style={{ height }}
        data-testid="no-data-message"
      >
        <p className="text-gray-500 dark:text-gray-400">
          No balance history data available
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};
