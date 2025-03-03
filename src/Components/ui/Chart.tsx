import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartVariants = cva('relative', {
  variants: {
    variant: {
      default: '',
      card: 'rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800',
    },
    size: {
      sm: 'h-48',
      md: 'h-64',
      lg: 'h-96',
      auto: 'h-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type ChartTypes = 'line' | 'bar' | 'doughnut';

// Default chart options that follow our design system
const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        padding: 16,
        font: {
          family: "'Inter var', sans-serif",
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        family: "'Inter var', sans-serif",
        size: 12,
        weight: 600,
      },
      bodyFont: {
        family: "'Inter var', sans-serif",
        size: 12,
      },
      padding: 12,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Inter var', sans-serif",
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: "'Inter var', sans-serif",
          size: 12,
        },
      },
    },
  },
};

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  type: ChartTypes;
  data: ChartData<ChartTypes>;
  options?: ChartOptions<ChartTypes>;
  loading?: boolean;
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, variant, size, type, data, options, loading, ...props }, ref) => {
    const chartOptions = React.useMemo(
      () => ({
        ...defaultOptions,
        ...options,
      }),
      [options]
    );

    const renderChart = () => {
      switch (type) {
        case 'line':
          return <Line data={data as ChartData<'line'>} options={chartOptions as ChartOptions<'line'>} />;
        case 'bar':
          return <Bar data={data as ChartData<'bar'>} options={chartOptions as ChartOptions<'bar'>} />;
        case 'doughnut':
          return <Doughnut data={data as ChartData<'doughnut'>} options={chartOptions as ChartOptions<'doughnut'>} />;
        default:
          return <Line data={data as ChartData<'line'>} options={chartOptions as ChartOptions<'line'>} />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          renderChart()
        )}
      </div>
    );
  }
);

Chart.displayName = 'Chart';

export { Chart, chartVariants }; 