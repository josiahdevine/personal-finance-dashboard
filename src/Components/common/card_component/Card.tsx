import React from 'react';
import './Card.css'; // Use the local CSS file

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  elevation?: 0 | 1 | 2 | 3 | 4;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  isInteractive?: boolean;
}

interface CardComposition {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Body: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
}

const Card: React.FC<CardProps> & CardComposition = ({
  children,
  className = '',
  onClick,
  elevation = 1,
  padding = 'md',
  border = true,
  isInteractive = false,
}) => {
  const elevationClass = `elevation-${elevation}`;
  const paddingClass = padding === 'none' ? '' : `p-${padding}`;
  const borderClass = border ? 'border' : '';
  const interactiveClass = isInteractive ? 'interactive' : '';
  
  const classes = [
    'card',
    elevationClass,
    paddingClass,
    borderClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

// Card subcomponents
const Header: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

const Body: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

const Footer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

// Attach subcomponents to Card
Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card; 