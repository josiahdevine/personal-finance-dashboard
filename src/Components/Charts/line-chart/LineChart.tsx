import React, { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';
import './LineChart.css';

export interface LineChartDataPoint {
  [key: string]: string | number | Date;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  dataKey: string;
  xAxisDataKey?: string;
  stroke?: string;
  height?: number | string;
  width?: number | string;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  areaOpacity?: number;
  customTooltip?: React.ReactNode;
  customLegend?: React.ReactNode;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  confidenceArea?: {
    dataKeyLower: string;
    dataKeyUpper: string;
    fill?: string;
    opacity?: number;
  };
  className?: string;
  animate?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKey,
  xAxisDataKey = 'name',
  stroke = 'var(--color-action-primary)',
  height = 300,
  width = '100%',
  margin = { top: 10, right: 30, left: 0, bottom: 10 },
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showDots = true,
  showArea = false,
  areaOpacity = 0.1,
  customTooltip,
  customLegend,
  yAxisFormatter,
  xAxisFormatter,
  confidenceArea,
  className,
  animate = true,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const handleMouseMove = (data: any) => {
    if (data && data.activeTooltipIndex !== undefined) {
      setActiveIndex(data.activeTooltipIndex);
    }
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };
  
  // Default formatters
  const defaultYAxisFormatter = (value: number) => 
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  
  const defaultXAxisFormatter = (value: string) => value;
  
  return (
    <div className={`line-chart-container ${className || ''}`}>
      <ResponsiveContainer width={width} height={height}>
        <RechartsLineChart
          data={data}
          margin={margin}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />}
          
          <XAxis 
            dataKey={xAxisDataKey} 
            tickFormatter={xAxisFormatter || defaultXAxisFormatter}
            tick={{ fill: 'var(--color-text-tertiary)' }}
            axisLine={{ stroke: 'var(--color-border-medium)' }}
            tickLine={{ stroke: 'var(--color-border-medium)' }}
          />
          
          <YAxis 
            tickFormatter={yAxisFormatter || defaultYAxisFormatter}
            tick={{ fill: 'var(--color-text-tertiary)' }}
            axisLine={{ stroke: 'var(--color-border-medium)' }}
            tickLine={{ stroke: 'var(--color-border-medium)' }}
          />
          
          {showTooltip && (
            customTooltip ? customTooltip : <Tooltip />
          )}
          
          {showLegend && (
            customLegend ? customLegend : <Legend />
          )}
          
          {confidenceArea && (
            <Area
              type="monotone"
              dataKey={confidenceArea.dataKeyLower}
              stroke="transparent"
              fill={confidenceArea.fill || 'var(--color-info-light)'}
              opacity={confidenceArea.opacity || 0.5}
            />
          )}
          
          {confidenceArea && (
            <Area
              type="monotone"
              dataKey={confidenceArea.dataKeyUpper}
              stroke="transparent"
              fill={confidenceArea.fill || 'var(--color-info-light)'}
              opacity={confidenceArea.opacity || 0.5}
            />
          )}
          
          {showArea && (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="transparent"
              fill={stroke}
              opacity={areaOpacity}
            />
          )}
          
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            dot={showDots ? { r: 4, strokeWidth: 2 } : false}
            activeDot={{ r: 6, strokeWidth: 2 }}
            isAnimationActive={animate}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 