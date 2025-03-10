import React from 'react';
import clsx from 'clsx';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  align?: 'left' | 'center' | 'right';
  color?: string;
  truncate?: boolean;
  as?: 'p' | 'span' | 'div' | 'label';
}

export const Text: React.FC<TextProps> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  leading = 'normal',
  align = 'left',
  color,
  truncate = false,
  as: Component = 'p',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const leadingClasses = {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const colorClass = color ? `text-${color}` : 'text-neutral-900 dark:text-neutral-100';
  const truncateClass = truncate ? 'truncate' : '';

  return (
    <Component
      className={clsx(
        sizeClasses[size],
        weightClasses[weight],
        leadingClasses[leading],
        alignClasses[align],
        colorClass,
        truncateClass,
        className
      )}
    >
      {children}
    </Component>
  );
}; 