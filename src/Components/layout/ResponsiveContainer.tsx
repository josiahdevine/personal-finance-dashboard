import React, { forwardRef } from 'react';
import { ResponsiveValue, responsiveClass, hideShow } from '../../styles/responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Define container variants using cva for consistent styling
const containerVariants = cva(
  "transition-all", // Base styles applied to all variants
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "p-2",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
        none: "",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow",
        md: "shadow-md", 
        lg: "shadow-lg",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "none",
      rounded: "default",
    }
  }
);

export interface ResponsiveContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  children: React.ReactNode;
  padding?: ResponsiveValue<string> | string;
  margin?: ResponsiveValue<string> | string;
  width?: ResponsiveValue<string> | string;
  maxWidth?: ResponsiveValue<string> | string;
  display?: ResponsiveValue<'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none'> | string;
  flexDirection?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'> | string;
  gap?: ResponsiveValue<string> | string;
  justifyContent?: ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'> | string;
  alignItems?: ResponsiveValue<'start' | 'end' | 'center' | 'baseline' | 'stretch'> | string;
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bgColor?: string;
  asChild?: boolean;
  as?: React.ElementType;
}

export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(({
  children,
  padding,
  margin,
  width,
  maxWidth,
  display = 'block',
  flexDirection,
  gap,
  justifyContent,
  alignItems,
  hideBelow,
  hideAbove,
  bgColor,
  className = '',
  variant,
  size,
  shadow,
  rounded,
  as: Component = 'div',
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  // Combine all classes
  const combinedClasses = cn(
    // Apply container variants
    containerVariants({ variant, size, shadow, rounded }),
    
    // Base styling
    isDarkMode ? 'text-white' : 'text-gray-900',
    
    // Responsive padding (if not using size variant)
    padding && size === "none" && responsiveClass('p', padding),
    
    // Responsive margin
    margin && responsiveClass('m', margin),
    
    // Responsive width
    width && responsiveClass('w', width),
    
    // Responsive max-width
    maxWidth && responsiveClass('max-w', maxWidth),
    
    // Responsive display
    display && responsiveClass('', display, (val) => {
      // Handle special case for 'flex' and 'grid' which are just class names
      return ['flex', 'grid', 'block', 'inline', 'inline-block', 'none'].includes(val as string) 
        ? val as string 
        : `display-${val}`;
    }),
    
    // Responsive flex direction
    flexDirection && responsiveClass('flex', flexDirection),
    
    // Responsive gap
    gap && responsiveClass('gap', gap),
    
    // Responsive justify content
    justifyContent && responsiveClass('justify', justifyContent),
    
    // Responsive align items
    alignItems && responsiveClass('items', alignItems),
    
    // Hide/show based on breakpoints
    (hideBelow || hideAbove) && hideShow({
      hideBelow: hideBelow as any,
      hideAbove: hideAbove as any,
    }),
    
    // Background color
    bgColor,
    
    // Additional className
    className,
  );

  return (
    <Component 
      ref={ref}
      className={combinedClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

ResponsiveContainer.displayName = 'ResponsiveContainer';

/**
 * A responsive grid component that changes column count at different breakpoints
 */
export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns: ResponsiveValue<number>;
  gap?: ResponsiveValue<string> | string;
  rowGap?: ResponsiveValue<string> | string;
  columnGap?: ResponsiveValue<string> | string;
  className?: string;
  padding?: ResponsiveValue<string> | string;
  autoRows?: string;
  container?: boolean;
  variant?: VariantProps<typeof containerVariants>['variant'];
  shadow?: VariantProps<typeof containerVariants>['shadow'];
  rounded?: VariantProps<typeof containerVariants>['rounded'];
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(({
  children,
  columns,
  gap,
  rowGap,
  columnGap,
  className = '',
  padding,
  autoRows,
  container = false,
  variant,
  shadow,
  rounded,
  ...props
}, ref) => {
  const gridClasses = cn(
    'grid',
    // Responsive columns
    responsiveClass('grid-cols', columns),
    
    // Responsive gap
    gap && responsiveClass('gap', gap),
    
    // Responsive row gap
    rowGap && responsiveClass('gap-y', rowGap),
    
    // Responsive column gap
    columnGap && responsiveClass('gap-x', columnGap),
    
    // Responsive padding
    padding && responsiveClass('p', padding),
    
    // Auto rows
    autoRows && `auto-rows-${autoRows}`,
    
    // Container variants if enabled
    container && containerVariants({ variant, shadow, rounded, size: 'none' }),
    
    // Additional className
    className,
  );

  return (
    <div 
      ref={ref}
      className={gridClasses}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

/**
 * A responsive flex container that changes layout at different breakpoints
 */
export interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: ResponsiveValue<'row' | 'col' | 'row-reverse' | 'col-reverse'>;
  wrap?: ResponsiveValue<'wrap' | 'nowrap' | 'wrap-reverse'> | string;
  justify?: ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'> | string;
  items?: ResponsiveValue<'start' | 'end' | 'center' | 'baseline' | 'stretch'> | string;
  gap?: ResponsiveValue<string> | string;
  className?: string;
  padding?: ResponsiveValue<string> | string;
  container?: boolean;
  variant?: VariantProps<typeof containerVariants>['variant'];
  shadow?: VariantProps<typeof containerVariants>['shadow'];
  rounded?: VariantProps<typeof containerVariants>['rounded'];
}

export const ResponsiveFlex = forwardRef<HTMLDivElement, ResponsiveFlexProps>(({
  children,
  direction,
  wrap,
  justify,
  items,
  gap,
  className = '',
  padding,
  container = false,
  variant,
  shadow,
  rounded,
  ...props
}, ref) => {
  const flexClasses = cn(
    'flex',
    
    // Responsive direction
    direction && responsiveClass('flex', direction),
    
    // Responsive wrap
    wrap && responsiveClass('flex', wrap),
    
    // Responsive justify
    justify && responsiveClass('justify', justify),
    
    // Responsive items alignment
    items && responsiveClass('items', items),
    
    // Responsive gap
    gap && responsiveClass('gap', gap),
    
    // Responsive padding
    padding && responsiveClass('p', padding),
    
    // Container variants if enabled
    container && containerVariants({ variant, shadow, rounded, size: 'none' }),
    
    // Additional className
    className,
  );

  return (
    <div 
      ref={ref}
      className={flexClasses}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveFlex.displayName = 'ResponsiveFlex'; 