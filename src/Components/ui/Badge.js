import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for displaying status, counts, or labels
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='default'] - Badge variant (default, success, warning, error)
 * @param {string} [props.size='md'] - Badge size (sm, md, lg)
 * @param {boolean} [props.isInteractive=false] - Whether the badge is clickable
 * @param {Function} [props.onClick] - Click handler for interactive badges
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Badge component
 */
function Badge({
  variant = 'default',
  size = 'md',
  isInteractive = false,
  onClick,
  children,
  className = '',
  ...props
}) {
  // Base badge classes
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  // Interactive classes
  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
    : '';
  
  // Combine classes
  const badgeClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.md,
    interactiveClasses,
    className,
  ].join(' ').replace(/\s+/g, ' ').trim();
  
  // Render as button if interactive, span otherwise
  if (isInteractive) {
    return (
      <button
        type="button"
        className={badgeClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <span
      className={badgeClasses}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isInteractive: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Badge; 