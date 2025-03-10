import React from 'react';
export {};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger' | 'success' | 'ghost' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-all duration-sm';
  
  const variantStyles = {
    primary: 'bg-primary-400 text-white hover:bg-primary-500 active:bg-primary-600 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 shadow-sm',
    secondary: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 shadow-sm',
    tertiary: 'bg-transparent text-primary-400 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
    outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
    danger: 'bg-red-400 text-white hover:bg-red-500 active:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shadow-sm',
    success: 'bg-green-400 text-white hover:bg-green-500 active:bg-green-600 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-sm',
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2',
    text: 'bg-transparent text-primary-400 hover:text-primary-500 active:text-primary-600 focus:ring-0 hover:underline'
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  };

  const disabledStyles = disabled ? 
    'opacity-50 cursor-not-allowed pointer-events-none' : 
    '';
  
  const loadingStyles = loading ? 
    'relative text-transparent transition-none cursor-wait' : 
    '';
    
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        ${loadingStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spinner h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      
      {!loading && (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
