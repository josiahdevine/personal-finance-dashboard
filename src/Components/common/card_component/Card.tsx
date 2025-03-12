import './Card.css'; // Use the local CSS file
import React from 'react';

/**
 * @deprecated This Card component is deprecated and will be removed in a future version.
 * Please use the ShadCN card component from 'src/components/ui/card.tsx' instead.
 * Example: import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
 */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4; // Shadow elevation levels
  isInteractive?: boolean; // Whether the card should have hover effects
  padding?: 'none' | 'sm' | 'md' | 'lg'; // Padding options
  onClick?: () => void; // Optional click handler
}

/**
 * @deprecated This Card component is deprecated. Please use ShadCN UI Card instead.
 */
const Card: React.FC<CardProps> & CardComposition = ({ 
  children, 
  className = '', 
  elevation = 1, 
  isInteractive = false,
  padding = 'md',
  onClick
}) => {
  React.useEffect(() => {
    console.warn('The Card component from src/components/common/card_component/Card.tsx is deprecated. Please use the ShadCN UI Card component instead.');
  }, []);

  const cardClasses = `
    card 
    elevation-${elevation} 
    ${isInteractive ? 'interactive' : ''} 
    p-${padding} 
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

// Subcomponents
const Header: React.FC<{children: React.ReactNode, className?: string}> = ({ 
  children,
  className = '' 
}) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

const Body: React.FC<{children: React.ReactNode, className?: string}> = ({ 
  children,
  className = '' 
}) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

const Footer: React.FC<{children: React.ReactNode, className?: string}> = ({ 
  children,
  className = '' 
}) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

// Attach subcomponents
Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

// Define composition interface
interface CardComposition {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
}

export default Card; 