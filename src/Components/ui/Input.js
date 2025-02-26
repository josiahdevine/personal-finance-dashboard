import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component for text entry with various states
 * 
 * @param {object} props - Component props
 * @param {string} [props.type='text'] - Input type (text, email, password, etc.)
 * @param {string} [props.label] - Input label text
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.helperText] - Helper text displayed below the input
 * @param {string} [props.errorText] - Error text displayed below the input when there's an error
 * @param {boolean} [props.isError=false] - Whether the input has an error
 * @param {boolean} [props.isDisabled=false] - Whether the input is disabled
 * @param {boolean} [props.isRequired=false] - Whether the input is required
 * @param {string} [props.id] - Input ID (auto-generated if not provided)
 * @param {string} [props.name] - Input name attribute
 * @param {string} [props.value] - Input value
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ForwardedRef} ref - Forwarded ref
 * @returns {React.ReactElement} - The Input component
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
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
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base input container classes
  const containerClasses = 'mb-4';
  
  // Base label classes
  const labelClasses = `block text-sm font-medium ${isError ? 'text-red-600' : 'text-gray-700'} mb-1`;
  
  // Base input classes
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-offset-0
    ${isError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
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
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={isDisabled}
        required={isRequired}
        className={inputClasses}
        aria-invalid={isError}
        aria-describedby={`${inputId}-text`}
        {...rest}
      />
      
      {(helperText || errorText) && (
        <p id={`${inputId}-text`} className={textClasses}>
          {isError ? errorText : helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
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

export default Input; 