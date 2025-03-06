import React from 'react';
export {};

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const baseStyles = 'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const sizeStyles = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-12'
  };

  const toggleStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const translateStyles = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-6'
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${toggleStyles[size]}
          ${checked ? translateStyles[size] : 'translate-x-0'}
        `}
      />
    </button>
  );
};
