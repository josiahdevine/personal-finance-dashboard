import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const toastVariants = cva(
  'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        success: 'bg-success-50 border-success-200 dark:bg-success-900 dark:border-success-800',
        error: 'bg-error-50 border-error-200 dark:bg-error-900 dark:border-error-800',
        warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800',
        info: 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const toastIconVariants = cva('h-6 w-6', {
  variants: {
    variant: {
      default: 'text-gray-900 dark:text-gray-100',
      success: 'text-success-600 dark:text-success-400',
      error: 'text-error-600 dark:text-error-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const toastTitleVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-gray-900 dark:text-gray-100',
      success: 'text-success-900 dark:text-success-100',
      error: 'text-error-900 dark:text-error-100',
      warning: 'text-yellow-900 dark:text-yellow-100',
      info: 'text-blue-900 dark:text-blue-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const toastDescriptionVariants = cva('text-sm opacity-90', {
  variants: {
    variant: {
      default: 'text-gray-700 dark:text-gray-300',
      success: 'text-success-700 dark:text-success-300',
      error: 'text-error-700 dark:text-error-300',
      warning: 'text-yellow-700 dark:text-yellow-300',
      info: 'text-blue-700 dark:text-blue-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, icon, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-start gap-4">
          {icon && (
            <div className={cn(toastIconVariants({ variant }))}>{icon}</div>
          )}
          <div className="grid gap-1">
            {title && (
              <div className={cn(toastTitleVariants({ variant }))}>{title}</div>
            )}
            {description && (
              <div className={cn(toastDescriptionVariants({ variant }))}>
                {description}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast, toastVariants }; 