import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius = '0.25rem',
  animation = 'pulse',
}) => {
  const { isDarkMode } = useTheme();
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-shimmer';
      default:
        return '';
    }
  };
  
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius,
  };
  
  return (
    <div 
      className={`
        ${getAnimationClass()} 
        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} 
        ${className}
      `}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
}; 