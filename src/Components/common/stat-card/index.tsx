import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  iconBackground?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  formatter?: (value: number | string) => string;
  variant?: 'default' | 'elevated' | 'outline' | 'minimal';
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  iconBackground = 'primary',
  formatter,
  variant = 'default',
  onClick,
  className = '',
  size = 'md',
  isLoading = false
}) => {
  const { isDarkMode } = useTheme();
  
  // Format value if formatter is provided
  const formattedValue = formatter ? formatter(value) : value;
  
  // Determine if trend is positive, negative, or neutral
  const isTrendPositive = trend !== undefined && trend > 0;
  const isTrendNegative = trend !== undefined && trend < 0;
  const trendValue = trend !== undefined ? Math.abs(trend) : undefined;
  const formattedTrend = trendValue !== undefined ? 
    (formatter ? formatter(trendValue) : `${trendValue}%`) : undefined;
  
  // Compute icon background color based on theme and iconBackground prop
  const iconBackgroundColors = {
    primary: isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600',
    success: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600',
    warning: isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600',
    danger: isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600',
    info: isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600',
    gray: isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
  };
  
  // Compute trend colors based on theme
  const trendColors = {
    positive: isDarkMode ? 'text-green-400' : 'text-green-600',
    negative: isDarkMode ? 'text-red-400' : 'text-red-600',
    neutral: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };
  
  // Compute variant-specific styles
  const variantStyles = {
    default: isDarkMode 
      ? 'bg-gray-800 border border-gray-700 shadow-sm' 
      : 'bg-white border border-gray-200 shadow-sm',
    elevated: isDarkMode 
      ? 'bg-gray-800 border border-gray-700 shadow-md' 
      : 'bg-white border border-gray-200 shadow-md',
    outline: isDarkMode 
      ? 'bg-transparent border border-gray-700' 
      : 'bg-transparent border border-gray-300',
    minimal: isDarkMode 
      ? 'bg-transparent' 
      : 'bg-transparent'
  };
  
  // Compute size-specific styles
  const sizeStyles = {
    sm: {
      padding: 'p-3',
      titleText: 'text-xs',
      valueText: 'text-lg font-semibold',
      subtitleText: 'text-xs',
      iconSize: 'h-8 w-8 p-1.5'
    },
    md: {
      padding: 'p-4',
      titleText: 'text-sm',
      valueText: 'text-2xl font-bold',
      subtitleText: 'text-sm',
      iconSize: 'h-10 w-10 p-2'
    },
    lg: {
      padding: 'p-5',
      titleText: 'text-base',
      valueText: 'text-3xl font-bold',
      subtitleText: 'text-base',
      iconSize: 'h-12 w-12 p-2.5'
    }
  };
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div 
        className={`rounded-lg ${variantStyles[variant]} ${sizeStyles[size].padding} animate-pulse ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="w-full">
            <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3 mb-3`}></div>
            <div className={`h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3 mb-2`}></div>
            {subtitle && (
              <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mt-2`}></div>
            )}
          </div>
          {icon && (
            <div className={`rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${sizeStyles[size].iconSize}`}></div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={`rounded-lg ${variantStyles[variant]} ${sizeStyles[size].padding} ${className}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`${sizeStyles[size].titleText} font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </h3>
          <div className="flex items-end mt-1">
            <div className={`${sizeStyles[size].valueText} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formattedValue}
            </div>
            
            {trend !== undefined && (
              <div 
                className={`flex items-center ml-2 mb-1 ${
                  isTrendPositive ? trendColors.positive : 
                  isTrendNegative ? trendColors.negative : 
                  trendColors.neutral
                }`}
              >
                {isTrendPositive ? (
                  <ArrowUpIcon className="h-4 w-4 mr-0.5" />
                ) : isTrendNegative ? (
                  <ArrowDownIcon className="h-4 w-4 mr-0.5" />
                ) : null}
                <span className="text-sm font-medium">
                  {formattedTrend}
                </span>
              </div>
            )}
          </div>
          
          {(subtitle || trendLabel) && (
            <p className={`${sizeStyles[size].subtitleText} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {subtitle || trendLabel}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`rounded-full ${iconBackgroundColors[iconBackground]} ${sizeStyles[size].iconSize} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}; 