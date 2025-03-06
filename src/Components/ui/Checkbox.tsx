import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  name,
  id,
  className = ''
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const uniqueId = id || name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          id={uniqueId}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          onKeyDown={handleKeyDown}
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : ''}
          `}
          aria-describedby={
            helperText || error ? `${uniqueId}-description` : undefined
          }
        />
      </div>
      {(label || helperText || error) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={uniqueId}
              className={`
                text-sm font-medium
                ${disabled ? 'text-gray-400' : 'text-gray-900'}
                ${error ? 'text-red-500' : ''}
              `}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {(helperText || error) && (
            <p
              id={`${uniqueId}-description`}
              className={`mt-1 text-sm ${
                error ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {error || helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 