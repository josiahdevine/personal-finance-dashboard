import React, { forwardRef } from 'react';
import { Input } from './input';
import { cn } from '../../lib/utils';

export interface EnhancedInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      helperText,
      errorText,
      isInvalid = false,
      leftIcon,
      rightIcon,
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
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    
    return (
      <div className={cn('flex flex-col space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              disabled && 'opacity-70',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <Input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              fullWidth && 'w-full',
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && !errorText && (
          <p
            id={`${inputId}-helper`}
            className={cn(
              'text-sm text-muted-foreground',
              helperClassName
            )}
          >
            {helperText}
          </p>
        )}
        
        {errorText && (
          <p
            id={`${inputId}-error`}
            className={cn(
              'text-sm text-destructive',
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

EnhancedInput.displayName = 'EnhancedInput'; 