import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  className?: string;
}

const sizeStyles = {
  sm: {
    toggle: 'w-8 h-4',
    dot: 'h-3 w-3',
    translate: 'translate-x-4',
    label: 'text-sm'
  },
  md: {
    toggle: 'w-11 h-6',
    dot: 'h-5 w-5',
    translate: 'translate-x-5',
    label: 'text-base'
  },
  lg: {
    toggle: 'w-14 h-7',
    dot: 'h-6 w-6',
    translate: 'translate-x-7',
    label: 'text-lg'
  }
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  labelPosition = 'right',
  className = ''
}) => {
  const styles = sizeStyles[size];
  const labelClasses = `${styles.label} font-medium text-gray-900 select-none`;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:ring-offset-2 ${styles.toggle}
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
    >
      <span className="sr-only">{label || 'Toggle'}</span>
      <span
        className={`
          pointer-events-none inline-block transform rounded-full bg-white shadow
          ring-0 transition duration-200 ease-in-out ${styles.dot}
          ${checked ? styles.translate : 'translate-x-0'}
        `}
      />
    </button>
  );

  if (!label) {
    return toggle;
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {labelPosition === 'left' && (
        <label className={`${labelClasses} mr-3`}>{label}</label>
      )}
      {toggle}
      {labelPosition === 'right' && (
        <label className={`${labelClasses} ml-3`}>{label}</label>
      )}
    </div>
  );
}; 