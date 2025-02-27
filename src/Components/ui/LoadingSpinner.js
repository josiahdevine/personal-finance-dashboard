import React from 'react';

/**
 * A reusable loading spinner component with customizable size and color
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (default: 'md')
 * @param {string} props.color - Color of the spinner (default: 'primary')
 * @param {string} props.text - Optional text to display below spinner
 * @returns {JSX.Element} The LoadingSpinner component
 */
const LoadingSpinner = ({ size = 'md', color = 'primary', text }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  };

  // Color mappings
  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-indigo-500',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 