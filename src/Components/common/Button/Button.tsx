import React from 'react';
import './Button.css';

/**
 * @deprecated This Button component is deprecated and will be removed in a future version.
 * Please use the ShadCN Button component from 'src/components/ui/button.tsx' instead.
 * For migration instructions, see docs/components/BUTTON_MIGRATION_GUIDE.md
 */

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'text' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}

/**
 * @deprecated This Button component is deprecated. Please use ShadCN UI Button instead.
 * For migration instructions, see docs/components/BUTTON_MIGRATION_GUIDE.md
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isFullWidth = false,
  isLoading = false,
  isDisabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
}) => {
  React.useEffect(() => {
    console.warn('The Button component from src/components/common/button/Button.tsx is deprecated. Please use the ShadCN UI Button component instead. See docs/components/BUTTON_MIGRATION_GUIDE.md for migration instructions.');
  }, []);

  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClasses = isFullWidth ? 'btn-full-width' : '';
  const stateClasses = [
    isLoading ? 'btn-loading' : '',
    isDisabled ? 'btn-disabled' : '',
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${stateClasses} ${className}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {isLoading && (
        <span className="btn-spinner">
          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      {!isLoading && leftIcon && (
        <span className="btn-icon-left">{leftIcon}</span>
      )}
      
      <span className="btn-text">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="btn-icon-right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
