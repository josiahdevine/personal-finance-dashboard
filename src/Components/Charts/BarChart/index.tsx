import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface BarChartProps {
  data: BarChartDataItem[];
  height?: number | string;
  width?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  showGrid?: boolean;
  layout?: 'vertical' | 'horizontal';
  isAnimated?: boolean;
  isInteractive?: boolean;
  className?: string;
  maxValue?: number;
  minValue?: number;
  barSpacing?: number;
  barRadius?: number;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  colors?: string[];
}

export const BarChart: React.FC<BarChartProps> = ({
  data = [],
  height = 300,
  width = '100%',
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter = (value) => value.toString(),
  labelFormatter = (label) => label,
  showGrid = true,
  layout = 'vertical',
  isAnimated = true,
  isInteractive = true,
  className,
  maxValue: customMaxValue,
  minValue: customMinValue,
  barSpacing = 0.2, // 20% of bar width
  barRadius = 4,
  padding = { top: 20, right: 20, bottom: 30, left: 40 },
  colors = [
    'var(--color-action-primary, #3366FF)',
    'var(--color-positive, #00C48C)',
    'var(--color-warning, #FFAA00)',
    'var(--color-negative, #FF6B6B)',
    'var(--tw-colors-investment-crypto, #9966FF)'
  ],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{ 
    x: number; 
    y: number; 
    value: number; 
    label: string;
    color: string; 
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Calculate padding values with defaults
  const paddingTop = padding.top || 20;
  const paddingRight = padding.right || 20;
  const paddingBottom = padding.bottom || 30;
  const paddingLeft = padding.left || 40;

  // Find min and max values
  const minValue = customMinValue !== undefined ? customMinValue : Math.min(0, ...data.map(d => d.value));
  const maxValue = customMaxValue !== undefined ? customMaxValue : Math.max(...data.map(d => d.value));

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
  }, [isAnimated, data, containerWidth, containerHeight]);

  // Calculate bars
  const bars = data.map((item, index) => {
    const color = item.color || colors[index % colors.length];
    
    if (layout === 'vertical') {
      // Vertical bars (values on y-axis)
      const barWidth = (containerWidth - paddingLeft - paddingRight) / data.length * (1 - barSpacing);
      const barHeight = scaleY(item.value, minValue, maxValue, 0, containerHeight - paddingTop - paddingBottom);
      const x = paddingLeft + (index * (containerWidth - paddingLeft - paddingRight) / data.length) + (barSpacing * (containerWidth - paddingLeft - paddingRight) / data.length / 2);
      const y = containerHeight - paddingBottom - barHeight;
      
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: item.value,
        label: item.label,
        color,
      };
    } else {
      // Horizontal bars (values on x-axis)
      const barHeight = (containerHeight - paddingTop - paddingBottom) / data.length * (1 - barSpacing);
      const barWidth = scaleX(item.value, minValue, maxValue, 0, containerWidth - paddingLeft - paddingRight);
      const x = paddingLeft;
      const y = paddingTop + (index * (containerHeight - paddingTop - paddingBottom) / data.length) + (barSpacing * (containerHeight - paddingTop - paddingBottom) / data.length / 2);
      
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: item.value,
        label: item.label,
        color,
      };
    }
  });

  // Handle mouse move for tooltips
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isInteractive || !svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    // Find if we're hovering over a bar
    for (const bar of bars) {
      if (
        mouseX >= bar.x && 
        mouseX <= bar.x + bar.width && 
        mouseY >= bar.y && 
        mouseY <= bar.y + bar.height
      ) {
        setTooltipData({
          x: bar.x + bar.width / 2,
          y: bar.y,
          value: bar.value,
          label: bar.label,
          color: bar.color,
        });
        return;
      }
    }
    
    setTooltipData(null);
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  return (
    <div 
      ref={containerRef} 
      className={clsx('bar-chart-container relative', className)}
      style={{ height, width }}
    >
      <svg 
        ref={svgRef} 
        className="bar-chart"
        width="100%" 
        height="100%"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid Lines */}
        {showGrid && (
          <g className="grid-lines text-neutral-200 dark:text-neutral-700">
            {/* Grid lines depend on layout */}
            {layout === 'vertical' ? (
              // Horizontal grid lines for vertical layout
              Array.from({ length: 5 }).map((_, i) => {
                const y = containerHeight - paddingBottom - (
                  scaleY(
                    minValue + ((maxValue - minValue) * i) / 4,
                    minValue,
                    maxValue,
                    0,
                    containerHeight - paddingTop - paddingBottom
                  )
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
              })
            ) : (
              // Vertical grid lines for horizontal layout
              Array.from({ length: 5 }).map((_, i) => {
                const x = paddingLeft + (
                  scaleX(
                    minValue + ((maxValue - minValue) * i) / 4,
                    minValue,
                    maxValue,
                    0,
                    containerWidth - paddingLeft - paddingRight
                  )
                );
                return (
                  <line
                    key={`v-grid-${i}`}
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={containerHeight - paddingBottom}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  />
                );
              })
            )}
          </g>
        )}
        
        {/* Bars */}
        <g className="bars">
          {bars.map((bar, i) => (
            <rect
              key={`bar-${i}`}
              x={bar.x}
              y={bar.y}
              width={isAnimated ? (layout === 'vertical' ? bar.width : bar.width * animationProgress) : bar.width}
              height={isAnimated ? (layout === 'vertical' ? bar.height * animationProgress : bar.height) : bar.height}
              fill={bar.color}
              rx={barRadius}
              ry={barRadius}
              className={clsx(
                isInteractive && 'transition-opacity duration-200 hover:opacity-80',
                tooltipData?.label === bar.label ? 'opacity-80' : 'opacity-100'
              )}
              style={{
                transition: isAnimated ? 
                  `${layout === 'vertical' ? 'height' : 'width'} 0.5s cubic-bezier(0.4, 0, 0.2, 1)` 
                  : undefined
              }}
            />
          ))}
        </g>
        
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
          
          {/* Axis Labels and Ticks */}
          {layout === 'vertical' ? (
            <>
              {/* X Axis Labels (Item Labels) */}
              {bars.map((bar, i) => (
                <text
                  key={`x-label-${i}`}
                  x={bar.x + bar.width / 2}
                  y={containerHeight - paddingBottom + 16}
                  fontSize="10"
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {labelFormatter(bar.label)}
                </text>
              ))}
              
              {/* Y Axis Ticks (Values) */}
              {Array.from({ length: 5 }).map((_, i) => {
                const value = minValue + ((maxValue - minValue) * i) / 4;
                const y = containerHeight - paddingBottom - (
                  scaleY(
                    value,
                    minValue,
                    maxValue,
                    0,
                    containerHeight - paddingTop - paddingBottom
                  )
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
            </>
          ) : (
            <>
              {/* Y Axis Labels (Item Labels) */}
              {bars.map((bar, i) => (
                <text
                  key={`y-label-${i}`}
                  x={paddingLeft - 8}
                  y={bar.y + bar.height / 2}
                  fontSize="10"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="currentColor"
                >
                  {labelFormatter(bar.label)}
                </text>
              ))}
              
              {/* X Axis Ticks (Values) */}
              {Array.from({ length: 5 }).map((_, i) => {
                const value = minValue + ((maxValue - minValue) * i) / 4;
                const x = paddingLeft + (
                  scaleX(
                    value,
                    minValue,
                    maxValue,
                    0,
                    containerWidth - paddingLeft - paddingRight
                  )
                );
                return (
                  <g key={`x-tick-${i}`}>
                    <line
                      x1={x}
                      y1={containerHeight - paddingBottom}
                      x2={x}
                      y2={containerHeight - paddingBottom + 5}
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={containerHeight - paddingBottom + 16}
                      fontSize="10"
                      textAnchor="middle"
                      fill="currentColor"
                    >
                      {tooltipFormatter(value)}
                    </text>
                  </g>
                );
              })}
            </>
          )}
          
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
      </svg>
      
      {/* Tooltip */}
      {isInteractive && tooltipData && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white dark:bg-dark-surface shadow-elevation-3 dark:shadow-elevation-2 rounded py-1 px-2 text-xs transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 10}px`,
            borderLeft: `3px solid ${tooltipData.color}`,
          }}
        >
          <div className="font-medium text-neutral-900 dark:text-neutral-100">{tooltipFormatter(tooltipData.value)}</div>
          <div className="text-neutral-500 dark:text-neutral-400">{labelFormatter(tooltipData.label)}</div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function scaleX(value: number, min: number, max: number, rangeMin: number, rangeMax: number): number {
  return ((value - min) / (max - min)) * rangeMax;
}

function scaleY(value: number, min: number, max: number, rangeMin: number, rangeMax: number): number {
  return ((value - min) / (max - min)) * rangeMax;
} 