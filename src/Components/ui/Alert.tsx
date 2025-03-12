import React, { useState } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  // For backward compatibility with code that uses 'type' instead of 'variant'
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  // Allow passing content as 'message' prop OR as children
  message?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  onClose?: () => void; // Alias for onDismiss for backward compatibility
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    content: 'text-blue-700',
    button: 'text-blue-500 hover:bg-blue-100'
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    content: 'text-green-700',
    button: 'text-green-500 hover:bg-green-100'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    content: 'text-yellow-700',
    button: 'text-yellow-500 hover:bg-yellow-100'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    content: 'text-red-700',
    button: 'text-red-500 hover:bg-red-100'
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  type,
  title,
  message,
  children,
  dismissible = false,
  icon,
  onDismiss,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  // Use type prop if variant is not provided (for backward compatibility)
  const actualVariant = type || variant;
  const styles = variantStyles[actualVariant];

  const handleDismiss = () => {
    setIsVisible(false);
    // Support both callback names
    onDismiss?.();
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        relative rounded-lg border p-4 ${styles.container} ${className}
      `}
      role="alert"
    >
      <div className="flex">
        {icon && (
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
        )}
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${styles.content}`}>
            {message || children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none
                  focus:ring-2 focus:ring-offset-2 ${styles.button}
                `}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};