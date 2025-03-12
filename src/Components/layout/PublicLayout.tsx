import React from 'react';
import { PublicNavbar } from '../navigation/PublicNavbar';
import { EnhancedFooter } from './EnhancedFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * PublicLayout component for public/marketing pages
 * Includes the PublicNavbar and EnhancedFooter components
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showNavbar && <PublicNavbar />}
      
      <main className="flex-grow">
        {children}
      </main>
      
      {showFooter && <EnhancedFooter />}
    </div>
  );
};

export default PublicLayout; 