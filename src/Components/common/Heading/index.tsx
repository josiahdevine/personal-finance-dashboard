import React from 'react';
import clsx from 'clsx';

export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  align?: 'left' | 'center' | 'right';
  color?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  className,
  level,
  size,
  weight = 'semibold',
  tracking = 'normal',
  align = 'left',
  color,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Default size mapping based on heading level
  const defaultSizeClasses = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-3xl lg:text-4xl',
    3: 'text-2xl lg:text-3xl',
    4: 'text-xl lg:text-2xl',
    5: 'text-lg lg:text-xl',
    6: 'text-base lg:text-lg',
  };

  // Custom size classes if size prop is provided
  const customSizeClasses = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  // Use custom size if provided, otherwise use default based on level
  const sizeClass = size ? customSizeClasses[size] : defaultSizeClasses[level];

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const trackingClasses = {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const colorClass = color ? `text-${color}` : 'text-neutral-900 dark:text-neutral-100';
  const marginClass = `mb-${level}`;

  return (
    <Component
      className={clsx(
        sizeClass,
        weightClasses[weight],
        trackingClasses[tracking],
        alignClasses[align],
        colorClass,
        marginClass,
        className
      )}
    >
      {children}
    </Component>
  );
}; 