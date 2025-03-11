import React from 'react';
import './TrendIndicator.css';

interface TrendIndicatorProps {
  value: number;
  period?: string;
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  period = '30d',
  className = '',
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  
  const getVariantClass = () => {
    if (isPositive) return 'trend-indicator-positive';
    if (isNegative) return 'trend-indicator-negative';
    return 'trend-indicator-neutral';
  };
  
  const getIcon = () => {
    if (isPositive) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      );
    }
    
    if (isNegative) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      );
    }
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    );
  };
  
  const formatValue = () => {
    const absValue = Math.abs(value);
    return `${isPositive ? '+' : ''}${absValue.toFixed(2)}%`;
  };
  
  return (
    <div className={`trend-indicator ${getVariantClass()} ${className}`}>
      <span className="trend-indicator-icon">{getIcon()}</span>
      <span className="trend-indicator-value">{formatValue()}</span>
      <span className="trend-indicator-period">in {period}</span>
    </div>
  );
}; 