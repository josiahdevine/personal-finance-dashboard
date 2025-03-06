import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
  dark: 'bg-gray-800 text-white',
  light: 'bg-gray-100 text-gray-800',
  default: 'bg-gray-100 text-gray-600'
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1'
};

const dotSizeStyles = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5'
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rounded = true,
  dot = false,
  icon,
  children,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium';
  const roundedStyles = rounded ? 'rounded-full' : 'rounded';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const dotSize = dotSizeStyles[size];

  return (
    <span
      className={`${baseStyles} ${roundedStyles} ${variantStyle} ${sizeStyle} ${className}`}
    >
      {dot && (
        <span
          className={`${dotSize} rounded-full mr-1.5`}
          style={{
            backgroundColor: getComputedStyle(document.documentElement)
              .getPropertyValue(`--${variant}-dot-color`)
              .trim() || 'currentColor'
          }}
        />
      )}
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
}; 