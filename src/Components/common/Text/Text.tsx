import React from 'react';

export interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  size = 'base',
  weight = 'normal',
  align = 'left',
  className = '',
  children
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const sizeClass = sizeClasses[size] || 'text-base';
  const weightClass = weightClasses[weight] || 'font-normal';
  const alignClass = alignClasses[align] || 'text-left';

  const classes = `${sizeClass} ${weightClass} ${alignClass} ${className}`;

  return <p className={classes}>{children}</p>;
};

export default Text;
