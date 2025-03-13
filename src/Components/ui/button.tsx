import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-green-600 text-white shadow-sm hover:bg-green-700",
        warning:
          "bg-yellow-600 text-white shadow-sm hover:bg-yellow-700",
        info:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      width: {
        default: "",
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Additional accessibility label for the button. Useful when button only contains an icon. */
  ariaLabel?: string
  /** Used to identify the button in tests */
  testId?: string
}

/**
 * Button component with accessibility enhancements.
 * 
 * Features:
 * - Configurable variants, sizes, and widths
 * - Loading state with animated spinner
 * - Support for left and right icons
 * - Proper focus styling and keyboard navigation
 * - Comprehensive ARIA support
 * - Test IDs for automated testing
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    width,
    asChild = false, 
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    ariaLabel,
    testId,
    "aria-describedby": ariaDescribedBy,
    "aria-label": providedAriaLabel,
    type = "button",
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading
    
    // Use provided ariaLabel for aria-label, fall back to ariaLabel prop
    const effectiveAriaLabel = providedAriaLabel || ariaLabel
    
    // Log a warning if button only has an icon but no accessible label
    React.useEffect(() => {
      if (
        process.env.NODE_ENV !== 'production' &&
        !children && 
        (!leftIcon && !rightIcon) && 
        !effectiveAriaLabel
      ) {
        console.warn(
          "Button has no accessible text. " +
          "Please add a label, aria-label, or ariaLabel prop for accessibility."
        )
      }
    }, [children, leftIcon, rightIcon, effectiveAriaLabel])
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, width, className }))}
        ref={ref}
        disabled={isDisabled}
        type={type}
        aria-label={effectiveAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        data-loading={loading ? "true" : undefined}
        data-variant={variant}
        data-size={size}
        data-testid={testId}
        {...props}
      >
        {loading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="presentation"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        )}
        
        <span className="truncate">{children}</span>
        
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
