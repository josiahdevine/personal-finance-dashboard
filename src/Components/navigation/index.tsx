import React from 'react';
import { EnhancedHeader } from '../layout/EnhancedHeader';

/**
 * @deprecated This Navigation component is deprecated.
 * Use EnhancedHeader from 'src/components/layout/EnhancedHeader.tsx' for dashboard pages
 * or PublicNavbar from 'src/components/navigation/PublicNavbar.tsx' for public pages.
 */
export const Navigation: React.FC = () => {
  // Display warning in console when component is used
  React.useEffect(() => {
    console.warn('The Navigation component from src/components/navigation/index.tsx is deprecated. Please use EnhancedHeader or PublicNavbar instead.');
  }, []);

  // Return EnhancedHeader with proper props
  return <EnhancedHeader theme="light" onThemeToggle={() => console.log('Theme toggle clicked')} />;
}; 