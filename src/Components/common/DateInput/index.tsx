import React, { forwardRef, useState, useEffect } from 'react';
import clsx from 'clsx';

type DateInputSize = 'sm' | 'md' | 'lg';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: DateInputSize;
  fullWidth?: boolean;
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (date: Date | null, event: React.ChangeEvent<HTMLInputElement>) => void;
  minDate?: Date;
  maxDate?: Date;
  showCalendarIcon?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
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
      value: propValue,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      showCalendarIcon = true,
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
    const [displayValue, setDisplayValue] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const inputId = id || `date-input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Initialize the input value
    useEffect(() => {
      const initialValue = propValue !== undefined ? propValue : defaultValue;
      
      if (initialValue) {
        const date = initialValue instanceof Date ? initialValue : new Date(initialValue);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          formatAndSetDisplayValue(date);
        }
      }
    }, []);
    
    // Update when prop value changes
    useEffect(() => {
      if (propValue !== undefined) {
        const date = propValue instanceof Date ? propValue : new Date(propValue);
        if (!isNaN(date.getTime()) && (!selectedDate || date.getTime() !== selectedDate.getTime())) {
          setSelectedDate(date);
          formatAndSetDisplayValue(date);
        } else if (propValue === null || propValue === '') {
          setSelectedDate(null);
          setDisplayValue('');
        }
      }
    }, [propValue]);
    
    // Format date for display
    const formatAndSetDisplayValue = (date: Date | null) => {
      if (!date) {
        setDisplayValue('');
        return;
      }
      
      // Format as YYYY-MM-DD for input[type="date"]
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      setDisplayValue(`${year}-${month}-${day}`);
    };
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      let date: Date | null = null;
      
      if (inputValue) {
        date = new Date(inputValue);
        
        // Validate date
        if (isNaN(date.getTime())) {
          date = null;
        } else {
          // Check min/max constraints
          if (minDate && date < minDate) {
            date = new Date(minDate);
            formatAndSetDisplayValue(date);
          }
          if (maxDate && date > maxDate) {
            date = new Date(maxDate);
            formatAndSetDisplayValue(date);
          }
        }
      }
      
      setSelectedDate(date);
      
      if (onChange) {
        onChange(date, e);
      }
    };
    
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
    const hasRightIcon = !!rightIcon || showCalendarIcon;
    const leftIconClasses = hasLeftIcon ? 'pl-10' : '';
    const rightIconClasses = hasRightIcon ? 'pr-10' : '';

    // Calendar icon (default or custom)
    const calendarIcon = rightIcon || (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    );

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
            type="date"
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            min={minDate ? formatDateForInput(minDate) : undefined}
            max={maxDate ? formatDateForInput(maxDate) : undefined}
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
          
          {showCalendarIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
              {calendarIcon}
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

// Helper function to format date as YYYY-MM-DD for input[type="date"]
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

DateInput.displayName = 'DateInput'; 