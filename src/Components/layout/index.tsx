import React from 'react';
import useDeviceDetect from '../../utils/useDeviceDetect';
import Navigation from '../Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps the application content
 * Provides responsive layout adjustments based on device type
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Get device information from our custom hook
  const { isMobile, isTablet, isLandscape } = useDeviceDetect();
  
  // Determine appropriate padding based on device type
  const containerPadding = isMobile 
    ? 'px-4' 
    : isTablet 
      ? 'px-6' 
      : 'px-8';
      
  // Use smaller padding for mobile in landscape orientation
  const verticalPadding = (isMobile && isLandscape) ? 'py-3' : 'py-6';

  return (
    <div className={`min-h-screen bg-gray-100 ${containerPadding}`}>
      <Navigation />
      <main className={`container mx-auto ${verticalPadding}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 