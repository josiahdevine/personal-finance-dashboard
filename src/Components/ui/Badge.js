import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for displaying status, counts, or labels
 * 
 * @component
 * @example
 * ```jsx
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="danger" size="lg" rounded="full">99+</Badge>
 * <Badge variant="warning" icon={<AlertIcon />}>Warning</Badge>
 * ```
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'md',
  icon,
  isDot = false,
  onClick,
  className = '',
}) => {
  // Color variants
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    dark: 'bg-gray-700 text-white',
  };

  // Size variants
  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Border radius variants
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Composing the classes
  const badgeClasses = `
    inline-flex items-center font-medium
    ${variantStyles[variant] || variantStyles.default}
    ${sizeStyles[size] || sizeStyles.md}
    ${roundedStyles[rounded] || roundedStyles.md}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
    ${className}
  `;

  // If badge is used as a dot indicator (no text)
  if (isDot) {
    return (
      <span 
        className={`
          inline-block
          ${variantStyles[variant] || variantStyles.default}
          ${size === 'xs' || size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'}
          rounded-full
          ${className}
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      />
    );
  }

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <span className={`${children ? 'mr-1' : ''} ${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

Badge.propTypes = {
  /** Content to display inside the badge */
  children: PropTypes.node,
  /** Visual style of the badge */
  variant: PropTypes.oneOf([
    'default', 'primary', 'success', 'warning', 
    'danger', 'info', 'purple', 'pink', 'dark'
  ]),
  /** Size of the badge */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  /** Border radius style */
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  /** Optional icon to display before text */
  icon: PropTypes.node,
  /** If true, displays as a dot with no text */
  isDot: PropTypes.bool,
  /** Optional click handler */
  onClick: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge; 