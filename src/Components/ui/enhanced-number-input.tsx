import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { EnhancedInput, EnhancedInputProps } from './enhanced-input';
import { Plus, Minus } from 'lucide-react';

export interface EnhancedNumberInputProps extends Omit<EnhancedInputProps, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | null, event: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  precision?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  currency?: string;
  showControls?: boolean;
}

export const EnhancedNumberInput = forwardRef<HTMLInputElement, EnhancedNumberInputProps>(
  (
    {
      value: propValue,
      defaultValue,
      onChange,
      step = 1,
      precision,
      min,
      max,
      allowNegative = true,
      currency,
      showControls = false,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [internalValue, setInternalValue] = useState<number | null>(null);
    
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
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };
    
    // Use a composite right icon with the controls if showControls is true
    const compositeRightIcon = showControls ? (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={incrementValue}
          disabled={props.disabled || (max !== undefined && (internalValue || 0) >= max)}
          className={cn(
            'h-1/2 px-2 flex items-center justify-center',
            'hover:bg-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          tabIndex={-1}
        >
          <Plus className="h-3 w-3" />
        </button>
        
        <button
          type="button"
          onClick={decrementValue}
          disabled={props.disabled || 
                   (min !== undefined && (internalValue || 0) <= min) || 
                   (!allowNegative && (internalValue || 0) <= 0)}
          className={cn(
            'h-1/2 px-2 flex items-center justify-center',
            'hover:bg-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          tabIndex={-1}
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>
    ) : rightIcon;
    
    // Add currency as a left icon if provided
    const leftIcon = currency ? props.leftIcon || currency : props.leftIcon;
    
    return (
      <EnhancedInput
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        inputMode="decimal"
        rightIcon={compositeRightIcon}
        leftIcon={leftIcon}
        {...props}
      />
    );
  }
);

EnhancedNumberInput.displayName = 'EnhancedNumberInput'; 