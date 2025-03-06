import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'indigo'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    indigo: 'border-indigo-500',
    blue: 'border-blue-500',
    gray: 'border-gray-500'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          animate-spin rounded-full border-2 border-t-transparent
          ${sizeClasses[size]}
          ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo}
        `}
      />
    </div>
  );
};

export default LoadingSpinner; 