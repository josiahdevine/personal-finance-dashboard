import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface DataPoint {
  date: Date | string;
  value: number;
  [key: string]: any;
}

export interface LineChartProps {
  data: DataPoint[];
  height?: number | string;
  width?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  dateFormatter?: (date: Date | string) => string;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  curveType?: 'linear' | 'natural' | 'step' | 'monotone';
  isAnimated?: boolean;
  isInteractive?: boolean;
  className?: string;
  maxValue?: number;
  minValue?: number;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export const LineChart: React.FC<LineChartProps> = ({
  data = [],
  height = 300,
  width = '100%',
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter = (value) => value.toString(),
  dateFormatter = (date) => new Date(date).toLocaleDateString(),
  color = 'var(--color-action-primary, #3366FF)',
  showArea = true,
  showGrid = true,
  showPoints = true,
  curveType = 'monotone',
  isAnimated = true,
  isInteractive = true,
  className,
  maxValue: customMaxValue,
  minValue: customMinValue,
  padding = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number; date: Date | string } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Sort data by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Find min and max values
  const minValue = customMinValue !== undefined ? customMinValue : Math.min(0, ...sortedData.map(d => d.value));
  const maxValue = customMaxValue !== undefined ? customMaxValue : Math.max(...sortedData.map(d => d.value));
  
  // Find min and max dates
  const dates = sortedData.map(d => new Date(d.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  const paddingLeft = padding.left || 40;
  const paddingRight = padding.right || 20;
  const paddingTop = padding.top || 20;
  const paddingBottom = padding.bottom || 30;

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

  // Calculate point positions
  const points = sortedData.map(d => {
    const x = scaleX(new Date(d.date).getTime(), minDate, maxDate, paddingLeft, containerWidth - paddingRight);
    const y = scaleY(d.value, minValue, maxValue, containerHeight - paddingBottom, paddingTop);
    return { x, y, value: d.value, date: d.date };
  });

  // Generate SVG path
  const linePath = generateLinePath(points, curveType);
  const areaPath = generateAreaPath(points, curveType, containerHeight - paddingBottom);

  // Handle animation
  useEffect(() => {
    if (!isAnimated) {
      setAnimationProgress(1);
      return;
    }
    
    if (svgRef.current && points.length > 0) {
      const path = svgRef.current.querySelector('.line-path') as SVGPathElement | null;
      if (path) {
        setPathLength(path.getTotalLength());
      }
      
      setAnimationProgress(0);
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [points, isAnimated, containerWidth, containerHeight]);

  // Handle mouse move for tooltips
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isInteractive || !svgRef.current || !tooltipRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    
    // Find closest point
    let closestPoint = points[0];
    let minDistance = Math.abs(mouseX - closestPoint.x);
    
    for (const point of points) {
      const distance = Math.abs(mouseX - point.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    setTooltipData({
      x: closestPoint.x,
      y: closestPoint.y,
      value: closestPoint.value,
      date: closestPoint.date
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  return (
    <div 
      ref={containerRef} 
      className={clsx('line-chart-container relative', className)}
      style={{ height, width }}
    >
      <svg 
        ref={svgRef} 
        className="line-chart"
        width="100%" 
        height="100%"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid Lines */}
        {showGrid && (
          <g className="grid-lines text-neutral-200 dark:text-neutral-700">
            {/* Horizontal grid lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = scaleY(
                minValue + ((maxValue - minValue) * i) / 4,
                minValue,
                maxValue,
                containerHeight - paddingBottom,
                paddingTop
              );
              return (
                <line
                  key={`h-grid-${i}`}
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              );
            })}
            
            {/* Vertical grid lines */}
            {points.length > 1 && points.map((point, i) => (
              <line
                key={`v-grid-${i}`}
                x1={point.x}
                y1={paddingTop}
                x2={point.x}
                y2={containerHeight - paddingBottom}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.3"
              />
            ))}
          </g>
        )}
        
        {/* Area fill */}
        {showArea && points.length > 1 && (
          <path
            className="area-path fill-primary-100 dark:fill-primary-900 dark:opacity-20"
            d={areaPath}
            fill={color}
            opacity="0.2"
            style={{
              clipPath: isAnimated ? `polygon(0 0, ${animationProgress * 100}% 0, ${animationProgress * 100}% 100%, 0 100%)` : undefined
            }}
          />
        )}
        
        {/* Line */}
        {points.length > 1 && (
          <path
            className="line-path stroke-primary-400 dark:stroke-primary-300"
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={isAnimated ? {
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength - (pathLength * animationProgress),
              transition: `stroke-dashoffset 1s ${curveType === 'step' ? 'steps(${points.length})' : 'ease-in-out'}`
            } : undefined}
          />
        )}
        
        {/* Data Points */}
        {showPoints && points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth="2"
            style={isAnimated ? { 
              opacity: animationProgress >= (i / (points.length - 1)) ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            } : undefined}
          />
        ))}
        
        {/* X and Y Axis */}
        <g className="axis text-neutral-600 dark:text-neutral-400">
          {/* X Axis */}
          <line
            x1={paddingLeft}
            y1={containerHeight - paddingBottom}
            x2={containerWidth - paddingRight}
            y2={containerHeight - paddingBottom}
            stroke="currentColor"
            strokeWidth="1"
          />
          
          {/* Y Axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={containerHeight - paddingBottom}
            stroke="currentColor"
            strokeWidth="1"
          />
          
          {/* X Axis Ticks */}
          {points.length > 1 && points.filter((_, i) => i % Math.ceil(points.length / 5) === 0).map((point, i) => (
            <g key={`x-tick-${i}`}>
              <line
                x1={point.x}
                y1={containerHeight - paddingBottom}
                x2={point.x}
                y2={containerHeight - paddingBottom + 5}
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={containerHeight - paddingBottom + 16}
                fontSize="10"
                textAnchor="middle"
                fill="currentColor"
              >
                {dateFormatter(point.date)}
              </text>
            </g>
          ))}
          
          {/* Y Axis Ticks */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = minValue + ((maxValue - minValue) * i) / 4;
            const y = scaleY(
              value,
              minValue,
              maxValue,
              containerHeight - paddingBottom,
              paddingTop
            );
            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft - 5}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y}
                  fontSize="10"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="currentColor"
                >
                  {tooltipFormatter(value)}
                </text>
              </g>
            );
          })}
          
          {/* Axis Labels */}
          {xAxisLabel && (
            <text
              x={containerWidth / 2}
              y={containerHeight - 5}
              fontSize="12"
              textAnchor="middle"
              fill="currentColor"
            >
              {xAxisLabel}
            </text>
          )}
          
          {yAxisLabel && (
            <text
              x={10}
              y={containerHeight / 2}
              fontSize="12"
              textAnchor="middle"
              transform={`rotate(-90, 10, ${containerHeight / 2})`}
              fill="currentColor"
            >
              {yAxisLabel}
            </text>
          )}
        </g>
        
        {/* Highlight for active point */}
        {isInteractive && tooltipData && (
          <circle
            cx={tooltipData.x}
            cy={tooltipData.y}
            r={5}
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}
      </svg>
      
      {/* Tooltip */}
      {isInteractive && tooltipData && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white dark:bg-dark-surface shadow-elevation-3 dark:shadow-elevation-2 rounded py-1 px-2 text-xs transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 10}px`,
          }}
        >
          <div className="font-medium text-neutral-900 dark:text-neutral-100">{tooltipFormatter(tooltipData.value)}</div>
          <div className="text-neutral-500 dark:text-neutral-400">{dateFormatter(tooltipData.date)}</div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function scaleX(value: number, min: number, max: number, rangeMin: number, rangeMax: number): number {
  return ((value - min) / (max - min)) * (rangeMax - rangeMin) + rangeMin;
}

function scaleY(value: number, min: number, max: number, rangeMin: number, rangeMax: number): number {
  return rangeMin - ((value - min) / (max - min)) * (rangeMin - rangeMax);
}

function generateLinePath(points: Array<{ x: number; y: number }>, curveType: string): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  
  let path = `M${points[0].x},${points[0].y}`;
  
  if (curveType === 'linear') {
    // Simple line segments
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
  } else if (curveType === 'step') {
    // Step line (horizontal first)
    for (let i = 1; i < points.length; i++) {
      path += ` H${points[i].x} V${points[i].y}`;
    }
  } else if (curveType === 'monotone' || curveType === 'natural') {
    // Curved line using cubic bezier
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = i > 0 ? points[i - 1].x : points[i].x;
      const y0 = i > 0 ? points[i - 1].y : points[i].y;
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i + 1].x;
      const y2 = points[i + 1].y;
      const x3 = i < points.length - 2 ? points[i + 2].x : x2;
      const y3 = i < points.length - 2 ? points[i + 2].y : y2;
      
      const cp1x = x1 + (x2 - x0) / 6;
      const cp1y = y1 + (y2 - y0) / 6;
      const cp2x = x2 - (x3 - x1) / 6;
      const cp2y = y2 - (y3 - y1) / 6;
      
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
  }
  
  return path;
}

function generateAreaPath(points: Array<{ x: number; y: number }>, curveType: string, baselineY: number): string {
  if (points.length < 2) return '';
  
  const linePath = generateLinePath(points, curveType);
  return `${linePath} L${points[points.length - 1].x},${baselineY} L${points[0].x},${baselineY} Z`;
} 