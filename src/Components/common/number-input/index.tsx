import React, { forwardRef, useState, useEffect } from 'react';
import clsx from 'clsx';

type NumberInputSize = 'sm' | 'md' | 'lg';

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: NumberInputSize;
  fullWidth?: boolean;
  showControls?: boolean;
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | null, event: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  precision?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  currency?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
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
      showControls = false,
      value: propValue,
      defaultValue,
      onChange,
      step = 1,
      precision,
      min,
      max,
      allowNegative = true,
      currency,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      helperClassName = '',
      errorClassName = '',
      className,
      id,
      disabled,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [internalValue, setInternalValue] = useState<number | null>(null);
    const inputId = id || `number-input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Initialize the input value
    useEffect(() => {
      const initialValue = propValue !== undefined ? propValue : defaultValue;
      
      if (initialValue !== undefined) {
        const numValue = typeof initialValue === 'string' ? parseFloat(initialValue) : initialValue;
        setInternalValue(numValue);
        formatAndSetDisplayValue(numValue);
      }
    }, []);
    
    // Update when prop value changes
    useEffect(() => {
      if (propValue !== undefined) {
        const numValue = typeof propValue === 'string' ? parseFloat(propValue) : propValue;
        if (numValue !== internalValue) {
          setInternalValue(numValue);
          formatAndSetDisplayValue(numValue);
        }
      }
    }, [propValue]);
    
    // Format number for display with proper precision
    const formatAndSetDisplayValue = (value: number | null) => {
      if (value === null || isNaN(value)) {
        setDisplayValue('');
        return;
      }
      
      let formatted = value.toString();
      
      if (precision !== undefined) {
        formatted = value.toFixed(precision);
      }
      
      if (currency) {
        // Simple currency formatting - could be enhanced with Intl.NumberFormat
        formatted = `${currency} ${formatted}`;
      }
      
      setDisplayValue(formatted);
    };
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      // Parse the input as a number
      let numValue: number | null = null;
      
      if (inputValue !== '') {
        // Remove currency symbol and other non-numeric characters except decimal and negative sign
        const numericValue = inputValue.replace(currency ? currency : '', '').trim();
        numValue = parseFloat(numericValue);
        
        if (isNaN(numValue)) {
          numValue = null;
        } else {
          // Apply constraints
          if (min !== undefined && numValue < min) numValue = min;
          if (max !== undefined && numValue > max) numValue = max;
          if (!allowNegative && numValue < 0) numValue = 0;
        }
      }
      
      setInternalValue(numValue);
      
      if (onChange) {
        onChange(numValue, e);
      }
    };
    
    // Handle increment/decrement
    const incrementValue = () => {
      if (disabled) return;
      
      let newValue = (internalValue || 0) + step;
      if (max !== undefined && newValue > max) newValue = max;
      
      setInternalValue(newValue);
      formatAndSetDisplayValue(newValue);
      
      if (onChange) {
        // Create a synthetic event
        const syntheticEvent = {
          target: { value: newValue.toString() },
          currentTarget: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(newValue, syntheticEvent);
      }
    };
    
    const decrementValue = () => {
      if (disabled) return;
      
      let newValue = (internalValue || 0) - step;
      if (min !== undefined && newValue < min) newValue = min;
      if (!allowNegative && newValue < 0) newValue = 0;
      
      setInternalValue(newValue);
      formatAndSetDisplayValue(newValue);
      
      if (onChange) {
        // Create a synthetic event
        const syntheticEvent = {
          target: { value: newValue.toString() },
          currentTarget: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(newValue, syntheticEvent);
      }
    };
    
    // Format on blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      formatAndSetDisplayValue(internalValue);
      
      if (onBlur) {
        onBlur(e);
      }
    };
    
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    // Base input classes
    const baseInputClasses = 'block rounded-md border-neutral-300 shadow-sm focus:border-primary-400 focus:ring-primary-400 dark:bg-dark-surface dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary-400 text-right';
    
    // State-specific classes
    const stateClasses = isInvalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-400 dark:border-red-700 dark:focus:border-red-400'
      : disabled
      ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400'
      : '';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Icon container classes
    const hasLeftIcon = !!leftIcon || !!currency;
    const hasRightIcon = !!rightIcon || showControls;
    const leftIconClasses = hasLeftIcon ? 'pl-10' : '';
    const rightIconClasses = hasRightIcon ? 'pr-20' : '';

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
          {currency && !leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {currency}
            </div>
          )}
          
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
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
            min={min}
            max={max}
            step={step}
            {...props}
          />
          
          {rightIcon && !showControls && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {rightIcon}
            </div>
          )}
          
          {showControls && (
            <div className="absolute inset-y-0 right-0 flex items-stretch">
              <button
                type="button"
                onClick={decrementValue}
                disabled={disabled || (min !== undefined && (internalValue || 0) <= min)}
                className={clsx(
                  'flex items-center justify-center px-2 border-l border-neutral-300 dark:border-neutral-600',
                  'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                  'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                  'focus:outline-none focus:ring-1 focus:ring-primary-400',
                  disabled && 'opacity-50 cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
                aria-label="Decrease value"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={incrementValue}
                disabled={disabled || (max !== undefined && (internalValue || 0) >= max)}
                className={clsx(
                  'flex items-center justify-center px-2 border-l border-neutral-300 dark:border-neutral-600',
                  'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                  'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                  'focus:outline-none focus:ring-1 focus:ring-primary-400',
                  'rounded-r-md',
                  disabled && 'opacity-50 cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
                aria-label="Increase value"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
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

NumberInput.displayName = 'NumberInput'; 