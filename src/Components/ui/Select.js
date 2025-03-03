import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Select component for dropdown selection with various states
 * 
 * @param {object} props - Component props
 * @param {string} [props.label] - Select label text
 * @param {string} [props.placeholder] - Placeholder option text
 * @param {Array} props.options - Array of options for the select
 * @param {string} [props.helperText] - Helper text displayed below the select
 * @param {string} [props.errorText] - Error text displayed below the select when there's an error
 * @param {boolean} [props.isError=false] - Whether the select has an error
 * @param {boolean} [props.isDisabled=false] - Whether the select is disabled
 * @param {boolean} [props.isRequired=false] - Whether the select is required
 * @param {string} [props.id] - Select ID (auto-generated if not provided)
 * @param {string} [props.name] - Select name attribute
 * @param {string|number} [props.value] - Selected value
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ForwardedRef} ref - Forwarded ref
 * @returns {React.ReactElement} - The Select component
 */
const Select = forwardRef(({
  label,
  placeholder,
  options = [],
  helperText,
  errorText,
  isError = false,
  isDisabled = false,
  isRequired = false,
  id,
  name,
  value,
  onChange,
  onBlur,
  className = '',
  ...rest
}, ref) => {
  // Generate a unique ID if none provided
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base select container classes
  const containerClasses = 'mb-4';
  
  // Base label classes
  const labelClasses = `block text-sm font-medium ${isError ? 'text-red-600' : 'text-gray-700'} mb-1`;
  
  // Base select classes
  const selectClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm appearance-none
    focus:outline-none focus:ring-2 focus:ring-offset-0
    ${isError 
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
    ${className}
  `;
  
  // Helper/error text classes
  const textClasses = `mt-1 text-sm ${isError ? 'text-red-600' : 'text-gray-500'}`;
  
  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          required={isRequired}
          className={selectClasses}
          aria-invalid={isError}
          aria-describedby={`${selectId}-text`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {(helperText || errorText) && (
        <p id={`${selectId}-text`} className={textClasses}>
          {isError ? errorText : helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  isError: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isRequired: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string
};

export default Select; 