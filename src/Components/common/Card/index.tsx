import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'flat' | 'interactive';
  elevation?: 1 | 2 | 3 | 4 | 5;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className, actions }) => (
  <div className={clsx(
    'border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between',
    className
  )}>
    <div>{children}</div>
    {actions && <div className="flex items-center space-x-2">{actions}</div>}
  </div>
);

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={clsx('p-6', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={clsx(
    'border-t border-neutral-200 dark:border-neutral-700 px-6 py-4',
    className
  )}>
    {children}
  </div>
);

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ 
  children, 
  className, 
  noPadding = false, 
  variant = 'default',
  elevation = 1,
  onClick
}) => {
  const elevationClasses = {
    1: 'shadow-elevation-1',
    2: 'shadow-elevation-2',
    3: 'shadow-elevation-3',
    4: 'shadow-elevation-4',
    5: 'shadow-elevation-5',
  };

  const variantClasses = {
    default: `bg-white dark:bg-dark-surface rounded-lg ${elevationClasses[elevation]}`,
    flat: 'bg-white dark:bg-dark-surface rounded-lg border border-neutral-200 dark:border-neutral-700',
    interactive: `bg-white dark:bg-dark-surface rounded-lg ${elevationClasses[elevation]} hover:shadow-elevation-3 transition-shadow duration-sm cursor-pointer`
  };

  return (
    <div 
      className={clsx(
        variantClasses[variant],
        !noPadding && 'p-6',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter; 