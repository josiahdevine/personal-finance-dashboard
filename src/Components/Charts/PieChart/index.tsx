import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface PieChartDataItem {
  label: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number | string;
  width?: number | string;
  innerRadius?: number; // 0 for pie, > 0 for donut
  tooltipFormatter?: (value: number, total: number) => string;
  labelFormatter?: (label: string) => string;
  isAnimated?: boolean;
  isInteractive?: boolean;
  className?: string;
  padAngle?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left' | 'none';
  centerContent?: React.ReactNode;
  colors?: string[];
}

interface Segment {
  id: string;
  label: string;
  value: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
  color: string;
  path: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data = [],
  height = 300,
  width = 300,
  innerRadius = 0, // 0 for pie, > 0 for donut
  tooltipFormatter = (value, total) => `${((value / total) * 100).toFixed(1)}% (${value})`,
  labelFormatter = (label) => label,
  isAnimated = true,
  isInteractive = true,
  className,
  padAngle = 0.02,
  cornerRadius = 3,
  startAngle = 0,
  endAngle = Math.PI * 2,
  legendPosition = 'right',
  centerContent,
  colors = [
    'var(--color-action-primary, #3366FF)',
    'var(--color-positive, #00C48C)',
    'var(--color-warning, #FFAA00)',
    'var(--color-negative, #FF6B6B)',
    'var(--tw-colors-investment-crypto, #9966FF)',
    'var(--tw-colors-investment-bonds, #8295B3)',
    'var(--tw-colors-investment-realEstate, #FFAA00)',
  ],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<Segment | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Filter out zero values and sort data by value (descending)
  const filteredData = data
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Calculate total value
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  // Update container size on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerWidth(width);
        setContainerHeight(height);
      }
    };
    
    updateSize();
    
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Handle animation
  useEffect(() => {
    if (!isAnimated) {
      setAnimationProgress(1);
      return;
    }
    
    setAnimationProgress(0);
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isAnimated, data]);

  // Calculate chart dimensions
  const chartWidth = typeof width === 'number' ? width : containerWidth;
  const chartHeight = typeof height === 'number' ? height : containerHeight;
  
  // Adjust the chart size to fit container and legend
  const chartSize = Math.min(chartWidth, chartHeight);
  
  // Calculate center position
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  
  // Calculate radius
  const radius = Math.min(centerX, centerY) * 0.8; // 80% of the available space
  const donutRadius = innerRadius ? (innerRadius / 100) * radius : 0;

  // Calculate segments
  const segments: Segment[] = [];
  let currentAngle = startAngle;
  const angleRange = endAngle - startAngle;
  
  filteredData.forEach((item, index) => {
    const value = item.value;
    const percentage = value / total;
    const segmentAngle = percentage * angleRange;
    const color = item.color || colors[index % colors.length];
    
    // Calculate angles for this segment
    const segStartAngle = currentAngle;
    const segEndAngle = currentAngle + segmentAngle;
    
    // Calculate path
    const path = describeArc(
      centerX,
      centerY,
      radius,
      donutRadius,
      segStartAngle,
      isAnimated ? segStartAngle + (segEndAngle - segStartAngle) * animationProgress : segEndAngle,
      padAngle,
      cornerRadius
    );
    
    segments.push({
      id: `segment-${index}`,
      label: item.label,
      value: item.value,
      percentage,
      startAngle: segStartAngle,
      endAngle: segEndAngle,
      color,
      path,
    });
    
    currentAngle += segmentAngle;
  });

  // Handle mouse over for segments
  const handleMouseOver = (segment: Segment) => {
    if (!isInteractive) return;
    setTooltipData(segment);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setTooltipData(null);
  };

  // Calculate legend position and dimensions
  const legendWidth = legendPosition === 'right' || legendPosition === 'left' ? 120 : chartWidth;
  
  let chartContainerStyles = {};
  const legendContainerStyles = {};
  
  if (legendPosition === 'right') {
    chartContainerStyles = { display: 'flex', flexDirection: 'row' as const };
  } else if (legendPosition === 'left') {
    chartContainerStyles = { display: 'flex', flexDirection: 'row-reverse' as const };
  } else if (legendPosition === 'bottom') {
    chartContainerStyles = { display: 'flex', flexDirection: 'column' as const };
  } else if (legendPosition === 'top') {
    chartContainerStyles = { display: 'flex', flexDirection: 'column-reverse' as const };
  }

  return (
    <div 
      ref={containerRef} 
      className={clsx('pie-chart-container relative', className)}
      style={{ height, width, ...chartContainerStyles }}
    >
      {/* Chart */}
      <div style={{ width: chartSize, height: chartSize }}>
        <svg 
          ref={svgRef} 
          className="pie-chart"
          width={chartSize} 
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
        >
          {/* Segments */}
          <g className="segments">
            {segments.map((segment) => (
              <path
                key={segment.id}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                onMouseOver={() => handleMouseOver(segment)}
                onMouseLeave={handleMouseLeave}
                className={clsx(
                  'transition-opacity duration-200',
                  isInteractive && 'hover:opacity-80 cursor-pointer',
                  tooltipData && tooltipData.id === segment.id ? 'opacity-80' : 'opacity-100'
                )}
              />
            ))}
          </g>
          
          {/* Center Content for Donut */}
          {innerRadius > 0 && centerContent && (
            <foreignObject
              x={centerX - donutRadius * 0.7}
              y={centerY - donutRadius * 0.7}
              width={donutRadius * 1.4}
              height={donutRadius * 1.4}
            >
              <div className="h-full w-full flex items-center justify-center text-center">
                {centerContent}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>
      
      {/* Legend */}
      {legendPosition !== 'none' && (
        <div 
          className={clsx(
            'flex',
            legendPosition === 'top' || legendPosition === 'bottom' ? 'flex-row flex-wrap justify-center' : 'flex-col',
            'text-sm'
          )}
          style={{
            width: legendWidth,
            ...(legendPosition === 'left' || legendPosition === 'right' ? { paddingLeft: 16 } : { paddingTop: 16 }),
            ...legendContainerStyles,
          }}
        >
          {segments.map((segment) => (
            <div 
              key={`legend-${segment.id}`}
              className={clsx(
                'flex items-center',
                legendPosition === 'top' || legendPosition === 'bottom' ? 'mr-4 mb-2' : 'mb-2'
              )}
              onMouseOver={() => handleMouseOver(segment)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: segment.color }} 
              />
              <div className="flex flex-col">
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {labelFormatter(segment.label)}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {tooltipFormatter(segment.value, total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Tooltip */}
      {isInteractive && tooltipData && !legendPosition && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white dark:bg-dark-surface shadow-elevation-3 dark:shadow-elevation-2 rounded py-1 px-2 text-xs z-10"
          style={{
            left: `${chartSize / 2}px`,
            top: `${chartSize / 2}px`,
            transform: 'translate(-50%, -50%)',
            borderLeft: `3px solid ${tooltipData.color}`,
          }}
        >
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {labelFormatter(tooltipData.label)}
          </div>
          <div className="text-neutral-500 dark:text-neutral-400">
            {tooltipFormatter(tooltipData.value, total)}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number): [number, number] {
  return [
    centerX + radius * Math.cos(angleInRadians),
    centerY + radius * Math.sin(angleInRadians)
  ];
}

function describeArc(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
  padAngle: number,
  _cornerRadius: number
): string {
  // If start and end angles are the same, return an empty path
  if (Math.abs(endAngle - startAngle) < 0.01) {
    return '';
  }
  
  // Apply padding angle
  const paddedStartAngle = startAngle + padAngle / 2;
  const paddedEndAngle = endAngle - padAngle / 2;
  
  // Check if we have a full circle
  const isFullCircle = Math.abs(paddedEndAngle - paddedStartAngle) >= Math.PI * 1.99;
  
  if (isFullCircle) {
    // For a full circle, create separate paths for inner and outer circles
    const outerCircle = `M ${centerX + outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}`;
    
    if (innerRadius > 0) {
      const innerCircle = `M ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}`;
      return `${outerCircle} ${innerCircle}`;
    }
    
    return outerCircle;
  }
  
  // Calculate points
  const [outerStartX, outerStartY] = polarToCartesian(centerX, centerY, outerRadius, paddedStartAngle);
  const [outerEndX, outerEndY] = polarToCartesian(centerX, centerY, outerRadius, paddedEndAngle);
  
  // Calculate large arc flag
  const largeArcFlag = paddedEndAngle - paddedStartAngle <= Math.PI ? 0 : 1;
  
  // Start building the path
  let path = `M ${outerStartX} ${outerStartY}`;
  
  // Outer arc
  path += ` A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`;
  
  // If it's a donut chart, add the inner arc
  if (innerRadius > 0) {
    const [innerEndX, innerEndY] = polarToCartesian(centerX, centerY, innerRadius, paddedEndAngle);
    const [innerStartX, innerStartY] = polarToCartesian(centerX, centerY, innerRadius, paddedStartAngle);
    
    // Line to inner radius
    path += ` L ${innerEndX} ${innerEndY}`;
    
    // Inner arc
    path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`;
    
    // Close the path
    path += ' Z';
  } else {
    // For a pie chart, we simply go back to the center
    path += ` L ${centerX} ${centerY} Z`;
  }
  
  return path;
} 