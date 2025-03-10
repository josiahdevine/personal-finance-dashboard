import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    options: SelectOption[];
    label?: string;
    helperText?: string;
    errorText?: string;
    isInvalid?: boolean;
    size?: SelectSize;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    containerClassName?: string;
    labelClassName?: string;
    selectClassName?: string;
    helperClassName?: string;
    errorClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            options,
            label,
            helperText,
            errorText,
            isInvalid = false,
            size = 'md',
            fullWidth = true,
            icon,
            containerClassName = '',
            labelClassName = '',
            selectClassName = '',
            helperClassName = '',
            errorClassName = '',
            className,
            id,
            disabled,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
        
        // Size classes
        const sizeClasses = {
            sm: 'px-2 py-1 text-sm',
            md: 'px-3 py-2 text-base',
            lg: 'px-4 py-3 text-lg',
        };

        // Base select classes
        const baseSelectClasses = 'block rounded-md border-neutral-300 shadow-sm focus:border-primary-400 focus:ring-primary-400 dark:bg-dark-surface dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary-400';
        
        // State-specific classes
        const stateClasses = isInvalid
            ? 'border-red-300 focus:border-red-400 focus:ring-red-400 dark:border-red-700 dark:focus:border-red-400'
            : disabled
            ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400'
            : '';

        // Width classes
        const widthClasses = fullWidth ? 'w-full' : '';
        
        // Icon classes
        const hasIcon = !!icon;
        const iconClasses = hasIcon ? 'pl-10' : '';

        return (
            <div className={clsx('flex flex-col', containerClassName)}>
                {label && (
                    <label
                        htmlFor={selectId}
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
                    {icon && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                            {icon}
                        </div>
                    )}
                    
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        className={clsx(
                            baseSelectClasses,
                            sizeClasses[size],
                            stateClasses,
                            widthClasses,
                            iconClasses,
                            selectClassName,
                            className
                        )}
                        aria-invalid={isInvalid}
                        aria-describedby={
                            helperText
                                ? `${selectId}-helper`
                                : errorText
                                ? `${selectId}-error`
                                : undefined
                        }
                        {...props}
                    >
                        {options.map(option => (
                            <option 
                                key={option.value} 
                                value={option.value} 
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                            className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                
                {helperText && !errorText && (
                    <p
                        id={`${selectId}-helper`}
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
                        id={`${selectId}-error`}
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

Select.displayName = 'Select'; 