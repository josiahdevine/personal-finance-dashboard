import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Toggle switch component for binary options
 * 
 * @component
 * @example
 * ```jsx
 * <Toggle 
 *   label="Enable notifications" 
 *   checked={notificationsEnabled} 
 *   onChange={handleToggleChange}
 *   labelPosition="left"
 * />
 * ```
 */
const Toggle = ({
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
  labelPosition = 'right',
  size = 'md',
  className = '',
}) => {
  const [innerChecked, setInnerChecked] = useState(checked);
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setInnerChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    // Make sure we have a valid event object
    if (!e || !e.target) {
            // Still toggle the state even if the event is invalid
      setInnerChecked(!innerChecked);
      if (onChange) {
        // Create a synthetic event if needed
        const syntheticEvent = e || { 
          target: { checked: !innerChecked },
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        onChange(syntheticEvent);
      }
      return;
    }
    
    setInnerChecked(e.target.checked);
    if (onChange) {
      onChange(e);
    }
  };

  // Size variants
  const sizeVariants = {
    sm: {
      switch: 'w-8 h-4',
      dot: 'h-3 w-3 translate-x-0.5',
      dotChecked: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      dot: 'h-5 w-5 translate-x-0.5',
      dotChecked: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      dot: 'h-6 w-6 translate-x-0.5',
      dotChecked: 'translate-x-7',
    },
  };

  const currentSize = sizeVariants[size] || sizeVariants.md;

  const switchClasses = `
    ${currentSize.switch}
    relative inline-flex flex-shrink-0 rounded-full cursor-pointer
    transition-colors ease-in-out duration-200
    ${innerChecked ? 'bg-blue-600' : 'bg-gray-200'} 
    ${isError ? 'ring-2 ring-red-500' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const dotClasses = `
    ${currentSize.dot}
    pointer-events-none inline-block rounded-full bg-white shadow
    transform ring-0 transition ease-in-out duration-200
    ${innerChecked ? currentSize.dotChecked : ''}
  `;

  const labelClasses = `
    text-sm font-medium 
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isError ? 'text-red-500' : 'text-gray-700'}
  `;

  return (
    <div className={`mb-4 ${className}`}>
      <div className={`flex items-center ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
        <label 
          htmlFor={toggleId} 
          className={`${labelClasses} ${labelPosition === 'left' ? 'mr-3' : 'ml-3'}`}
        >
          {label}
        </label>
        
        <button
          type="button"
          role="switch"
          id={toggleId}
          name={name}
          aria-checked={innerChecked}
          aria-describedby={`${toggleId}-helper ${toggleId}-error`}
          disabled={isDisabled}
          className={switchClasses}
          onClick={(e) => {
            if (e && e.target) {
              e.target.checked = !innerChecked;
              handleChange(e);
            }
          }}
          onKeyDown={(e) => {
            if (e && e.target) {
              e.target.checked = !innerChecked;
              handleChange(e);
            }
          }}
          tabIndex={0}
          onBlur={onBlur}
        >
          <span 
            className="sr-only"
            aria-hidden="true"
          >
            {innerChecked ? 'On' : 'Off'}
          </span>
          <span
            aria-hidden="true"
            className={dotClasses}
          />
        </button>
      </div>
      
      {helperText && !isError && (
        <p id={`${toggleId}-helper`} className="mt-1 text-sm text-gray-500 ml-0">
          {helperText}
        </p>
      )}
      
      {isError && errorText && (
        <p id={`${toggleId}-error`} className="mt-1 text-sm text-red-500 ml-0">
          {errorText}
        </p>
      )}
    </div>
  );
};

Toggle.propTypes = {
  /** Label text to display with the toggle */
  label: PropTypes.string.isRequired,
  /** Controls toggle checked state */
  checked: PropTypes.bool,
  /** Callback fired when the state changes */
  onChange: PropTypes.func,
  /** Callback fired when the toggle loses focus */
  onBlur: PropTypes.func,
  /** Unique identifier for the toggle */
  id: PropTypes.string,
  /** Name attribute for the toggle */
  name: PropTypes.string,
  /** Helper text to display below the toggle */
  helperText: PropTypes.string,
  /** Error message to display when isError is true */
  errorText: PropTypes.string,
  /** If true, displays the component in an error state */
  isError: PropTypes.bool,
  /** If true, disables the toggle */
  isDisabled: PropTypes.bool,
  /** Position of the label relative to the toggle - 'left' or 'right' */
  labelPosition: PropTypes.oneOf(['left', 'right']),
  /** Size of the toggle - 'sm', 'md', or 'lg' */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Additional CSS classes to apply to the container */
  className: PropTypes.string,
};

export default Toggle; 