import React from 'react';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size = 'xl',
  className = '',
  children
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const sizeClass = sizeClasses[size] || 'text-xl';
  const classes = `font-bold ${sizeClass} ${className}`;

  switch (level) {
    case 1:
      return <h1 className={classes}>{children}</h1>;
    case 3:
      return <h3 className={classes}>{children}</h3>;
    case 4:
      return <h4 className={classes}>{children}</h4>;
    case 5:
      return <h5 className={classes}>{children}</h5>;
    case 6:
      return <h6 className={classes}>{children}</h6>;
    case 2:
    default:
      return <h2 className={classes}>{children}</h2>;
  }
};

export default Heading;
