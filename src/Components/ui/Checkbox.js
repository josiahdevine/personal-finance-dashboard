import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Checkbox component for forms with customizable styling and states
 * 
 * @component
 * @example
 * ```jsx
 * <Checkbox 
 *   label="Accept terms and conditions" 
 *   checked={isAccepted} 
 *   onChange={handleChange}
 *   isRequired={true}
 * />
 * ```
 */
const Checkbox = ({
  label,
  checked = false,
  onChange,
  onBlur,
  id,
  name,
  helperText,
  errorText,
  isError = false,
  isDisabled = false,
  isRequired = false,
  className = '',
}) => {
  const [innerChecked, setInnerChecked] = useState(checked);
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setInnerChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    setInnerChecked(e.target.checked);
    if (onChange) {
      onChange(e);
    }
  };

  const checkboxClasses = `
    h-5 w-5 rounded 
    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
    ${isError
      ? 'border-red-300 text-red-500 focus:ring-red-500'
      : 'border-gray-300 text-blue-600 focus:ring-blue-500'
    }
    ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
    transition-colors duration-200 ease-in-out
  `;

  const labelClasses = `
    text-sm font-medium text-gray-700 ml-2
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isError ? 'text-red-500' : ''}
  `;

  const containerClasses = `
    flex items-center ${className}
  `;

  return (
    <div className="mb-4">
      <div className={containerClasses}>
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={innerChecked}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={isDisabled}
          required={isRequired}
          className={checkboxClasses}
          aria-describedby={`${checkboxId}-helper ${checkboxId}-error`}
          aria-invalid={isError}
        />
        <label htmlFor={checkboxId} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {helperText && !isError && (
        <p id={`${checkboxId}-helper`} className="mt-1 text-sm text-gray-500 ml-7">
          {helperText}
        </p>
      )}
      
      {isError && errorText && (
        <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-500 ml-7">
          {errorText}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  /** Label text to display next to the checkbox */
  label: PropTypes.string.isRequired,
  /** Controls checkbox checked state */
  checked: PropTypes.bool,
  /** Callback fired when the state changes */
  onChange: PropTypes.func,
  /** Callback fired when the checkbox loses focus */
  onBlur: PropTypes.func,
  /** Unique identifier for the checkbox */
  id: PropTypes.string,
  /** Name attribute for the checkbox */
  name: PropTypes.string,
  /** Helper text to display below the checkbox */
  helperText: PropTypes.string,
  /** Error message to display when isError is true */
  errorText: PropTypes.string,
  /** If true, displays the component in an error state */
  isError: PropTypes.bool,
  /** If true, disables the checkbox */
  isDisabled: PropTypes.bool,
  /** If true, marks the field as required */
  isRequired: PropTypes.bool,
  /** Additional CSS classes to apply to the container */
  className: PropTypes.string,
};

export default Checkbox; 