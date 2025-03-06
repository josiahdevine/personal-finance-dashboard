import React from 'react';
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
  Scale,
  CoreScaleOptions,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

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

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}

interface BalanceHistoryChartProps {
  labels: string[];
  datasets: Dataset[];
  height?: number;
  showLegend?: boolean;
}

export const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  labels,
  datasets,
  height = 300,
  showLegend = true,
}) => {
  const chartData = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      tension: 0.4,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, value: number | string, _index: number, _ticks: any[]) {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return value;
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}; 