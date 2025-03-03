import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const dropdownTriggerVariants = cva(
  'inline-flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        primary:
          'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700',
        secondary:
          'bg-secondary-500 text-white hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800',
        ghost:
          'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

const dropdownContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-800',
  {
    variants: {
      align: {
        start: 'origin-top-left',
        center: 'origin-top',
        end: 'origin-top-right',
      },
      sideOffset: {
        sm: 'mt-1',
        md: 'mt-2',
        lg: 'mt-3',
      },
    },
    defaultVariants: {
      align: 'start',
      sideOffset: 'md',
    },
  }
);

const dropdownItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  {
    variants: {
      variant: {
        default:
          'hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700',
        destructive:
          'text-error-600 hover:bg-error-50 focus:bg-error-50 dark:text-error-400 dark:hover:bg-error-900 dark:focus:bg-error-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DropdownProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownTriggerVariants> {
  trigger: React.ReactNode;
  align?: VariantProps<typeof dropdownContentVariants>['align'];
  sideOffset?: VariantProps<typeof dropdownContentVariants>['sideOffset'];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    trigger,
    align,
    sideOffset,
    open,
    onOpenChange,
    children,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false);

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <div className="relative" ref={ref} {...props}>
        <button
          type="button"
          className={cn(dropdownTriggerVariants({ variant, size, fullWidth, className }))}
          onClick={() => handleOpenChange(!isOpen)}
          aria-expanded={isOpen}
        >
          {trigger}
          <ChevronDown
            className={cn(
              'ml-2 h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => handleOpenChange(false)}
            />
            <div
              className={cn(
                dropdownContentVariants({ align, sideOffset }),
                'absolute z-50'
              )}
            >
              {children}
            </div>
          </>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export interface DropdownItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, variant, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menuitem"
        className={cn(dropdownItemVariants({ variant, className }))}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

export { Dropdown, DropdownItem, dropdownTriggerVariants, dropdownContentVariants, dropdownItemVariants }; 