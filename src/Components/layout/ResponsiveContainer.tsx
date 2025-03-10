import React from 'react';
import { ResponsiveValue, responsiveClass, hideShow } from '../../styles/responsive';
import { useTheme } from '../../contexts/ThemeContext';

export interface ResponsiveContainerProps {
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
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
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
}) => {
  const { isDarkMode } = useTheme();

  // Combine all classes
  const combinedClasses = [
    // Base styling
    isDarkMode ? 'text-white' : 'text-gray-900',
    
    // Responsive padding
    padding && responsiveClass('p', padding),
    
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
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

/**
 * A responsive grid component that changes column count at different breakpoints
 */
export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns: ResponsiveValue<number>;
  gap?: ResponsiveValue<string> | string;
  rowGap?: ResponsiveValue<string> | string;
  columnGap?: ResponsiveValue<string> | string;
  className?: string;
  padding?: ResponsiveValue<string> | string;
  autoRows?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap,
  rowGap,
  columnGap,
  className = '',
  padding,
  autoRows,
}) => {
  const gridClasses = [
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
    
    // Additional className
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

/**
 * A responsive flex container that changes layout at different breakpoints
 */
export interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: ResponsiveValue<'row' | 'col' | 'row-reverse' | 'col-reverse'>;
  wrap?: ResponsiveValue<'wrap' | 'nowrap' | 'wrap-reverse'> | string;
  justify?: ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'> | string;
  items?: ResponsiveValue<'start' | 'end' | 'center' | 'baseline' | 'stretch'> | string;
  gap?: ResponsiveValue<string> | string;
  className?: string;
  padding?: ResponsiveValue<string> | string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction,
  wrap,
  justify,
  items,
  gap,
  className = '',
  padding,
}) => {
  const flexClasses = [
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
    
    // Additional className
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}; 