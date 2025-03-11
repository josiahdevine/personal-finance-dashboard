import React from 'react';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import './FinancialMetric.css';

export interface FinancialMetricProps {
  label: string;
  value: number;
  previousValue?: number;
  formatType?: 'currency' | 'percentage' | 'number';
  currency?: string;
  className?: string;
}

const FinancialMetric: React.FC<FinancialMetricProps> = React.memo(({
  label,
  value,
  previousValue,
  formatType = 'currency',
  currency = 'USD',
  className = '',
}) => {
  // Calculate change percentage if previous value is provided
  const hasChange = previousValue !== undefined;
  const changePercentage = hasChange 
    ? ((value - previousValue) / Math.abs(previousValue)) * 100 
    : 0;
  
  // Format value based on type
  const formattedValue = formatType === 'currency'
    ? formatCurrency(value, currency)
    : formatType === 'percentage'
      ? formatPercentage(value)
      : value.toLocaleString();
  
  // Determine change direction for CSS class and icon
  const changeDirection = changePercentage > 0 
    ? 'positive' 
    : changePercentage < 0 
      ? 'negative' 
      : 'neutral';
  
  // Format the change percentage (always positive number)
  const formattedChange = formatPercentage(Math.abs(changePercentage));
  
  // Choose the appropriate icon
  const changeIcon = changePercentage > 0 
    ? '▲' 
    : changePercentage < 0 
      ? '▼' 
      : '•';
  
  return (
    <div className={`financial-metric ${className}`} data-testid="financial-metric">
      <div className="financial-metric-label" data-testid="financial-metric-label">{label}</div>
      <div className="financial-metric-value" data-testid="financial-metric-value">{formattedValue}</div>
      
      {hasChange && (
        <div 
          className={`financial-metric-change ${changeDirection}`}
          data-testid="financial-metric-change"
        >
          <span data-testid="financial-metric-icon">{changeIcon}</span>{' '}
          <span data-testid="financial-metric-percentage">{formattedChange}</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.value === nextProps.value &&
    prevProps.previousValue === nextProps.previousValue &&
    prevProps.formatType === nextProps.formatType &&
    prevProps.label === nextProps.label
  );
});

export default FinancialMetric; 