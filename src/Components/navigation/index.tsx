import React from 'react';
import { EnhancedHeader } from '../layout/EnhancedHeader';
import Header from './Header';
import { MobileMenu } from './MobileMenu';

/**
 * @deprecated This Navigation component is deprecated.
 * Use Header from 'src/components/navigation/Header.tsx' for modern unified header
 * or EnhancedHeader from 'src/components/layout/EnhancedHeader.tsx' for dashboard pages
 * or PublicNavbar from 'src/components/navigation/PublicNavbar.tsx' for public pages.
 */
export const Navigation: React.FC = () => {
  // Display warning in console when component is used
  React.useEffect(() => {
    console.warn('The Navigation component from src/components/navigation/index.tsx is deprecated. Please use Header, EnhancedHeader or PublicNavbar instead.');
  }, []);

  // Return EnhancedHeader with proper props
  return <EnhancedHeader theme="light" onThemeToggle={() => console.log('Theme toggle clicked')} />;
};

export { default as Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem, BreadcrumbProps } from './Breadcrumb';
export { Header, MobileMenu };
export default Header; 