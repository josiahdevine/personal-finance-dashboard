import React from 'react';
import './Card.css';

/**
 * @deprecated This Card component is deprecated and will be removed in a future version.
 * Please use the ShadCN card component from 'src/components/ui/card.tsx' instead.
 * Example: import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
 */
export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  elevation?: number;
  isInteractive?: boolean;
  padding?: string;
  onClick?: () => void;
}

/**
 * @deprecated This Card component is deprecated. Please use ShadCN UI Card instead.
 */
const Card = ({ 
  children, 
  className = '',
  elevation = 1,
  isInteractive = false,
  padding = 'p-4',
  onClick 
}: CardProps) => { 
  React.useEffect(() => {
    console.warn('The Card component from src/components/common/card/Card.tsx is deprecated. Please use the ShadCN UI Card component instead.');
  }, []);

  const elevationClass = elevation > 0 ? `shadow-${elevation}` : '';
  const interactiveClass = isInteractive ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';
  
  return (
    <div 
      className={`rounded-lg ${elevationClass} ${interactiveClass} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  ); 
};

Card.Header = ({ children }: { children?: React.ReactNode }) => <div className="pb-3 border-b border-gray-200 mb-3">{children}</div>;
Card.Body = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
Card.Footer = ({ children }: { children?: React.ReactNode }) => <div className="pt-3 border-t border-gray-200 mt-3">{children}</div>;

export default Card; 