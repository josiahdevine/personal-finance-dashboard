import React, { forwardRef } from 'react';
import clsx from 'clsx';

type InputSize = 'sm' | 'md' | 'lg';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      errorText,
      isInvalid = false,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      helperClassName = '',
      errorClassName = '',
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    // Base input classes
    const baseInputClasses = 'block rounded-md border-neutral-300 shadow-sm focus:border-primary-400 focus:ring-primary-400 dark:bg-dark-surface dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary-400';
    
    // State-specific classes
    const stateClasses = isInvalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-400 dark:border-red-700 dark:focus:border-red-400'
      : disabled
      ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400'
      : '';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Icon container classes
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    const leftIconClasses = hasLeftIcon ? 'pl-10' : '';
    const rightIconClasses = hasRightIcon ? 'pr-10' : '';

    return (
      <div className={clsx('flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-200',
              disabled && 'text-neutral-500 dark:text-neutral-400',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              baseInputClasses,
              sizeClasses[size],
              stateClasses,
              widthClasses,
              leftIconClasses,
              rightIconClasses,
              inputClassName,
              className
            )}
            aria-invalid={isInvalid}
            aria-describedby={
              helperText
                ? `${inputId}-helper`
                : errorText
                ? `${inputId}-error`
                : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && !errorText && (
          <p
            id={`${inputId}-helper`}
            className={clsx(
              'mt-1 text-sm text-neutral-600 dark:text-neutral-400',
              helperClassName
            )}
          >
            {helperText}
          </p>
        )}
        
        {errorText && (
          <p
            id={`${inputId}-error`}
            className={clsx(
              'mt-1 text-sm text-red-600 dark:text-red-400',
              errorClassName
            )}
          >
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput'; 