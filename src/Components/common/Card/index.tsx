import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={clsx('border-b border-gray-200 dark:border-gray-700 px-6 py-4', className)}>
    {children}
  </div>
);

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={clsx('p-6', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={clsx('border-t border-gray-200 dark:border-gray-700 px-6 py-4', className)}>
    {children}
  </div>
);

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children, className, noPadding = false }) => {
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm',
      !noPadding && 'p-6',
      className
    )}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter; 