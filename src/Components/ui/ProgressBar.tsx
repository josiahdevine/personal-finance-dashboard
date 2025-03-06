import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  className?: string;
}

const variantStyles = {
  primary: {
    bar: 'bg-blue-600',
    text: 'text-blue-700'
  },
  success: {
    bar: 'bg-green-600',
    text: 'text-green-700'
  },
  warning: {
    bar: 'bg-yellow-500',
    text: 'text-yellow-700'
  },
  danger: {
    bar: 'bg-red-600',
    text: 'text-red-700'
  }
};

const sizeStyles = {
  sm: {
    bar: 'h-1',
    text: 'text-xs'
  },
  md: {
    bar: 'h-2',
    text: 'text-sm'
  },
  lg: {
    bar: 'h-3',
    text: 'text-base'
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  animated = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const label = `${Math.round(percentage)}%`;
  const showInsideLabel = showLabel && labelPosition === 'inside' && percentage >= 10;
  const showOutsideLabel = showLabel && labelPosition === 'outside';

  return (
    <div className={className}>
      <div className="relative">
        <div
          className={`
            overflow-hidden rounded-full bg-gray-200
            ${sizeStyle.bar}
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              ${styles.bar} rounded-full transition-all duration-300
              ${animated ? 'animate-progress-indeterminate' : ''}
            `}
            style={{ width: `${percentage}%` }}
          >
            {showInsideLabel && (
              <span className={`
                absolute inset-0 flex items-center justify-center
                font-medium text-white ${sizeStyle.text}
              `}>
                {label}
              </span>
            )}
          </div>
        </div>
        {showOutsideLabel && (
          <div className={`mt-1 text-right ${styles.text} ${sizeStyle.text}`}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}; 