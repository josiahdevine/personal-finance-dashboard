import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useDeviceDetect from '../../utils/useDeviceDetect';
import { EnhancedHeader } from './EnhancedHeader';
import { Footer } from './Footer';
import DashboardLayout from './DashboardLayout';

/**
 * @deprecated This Layout component is deprecated and will be removed in a future version.
 * Please use the DashboardLayout component from 'src/components/layout/DashboardLayout.tsx' instead.
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * @deprecated This Layout component is deprecated. Please use DashboardLayout instead.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isLandscape } = useDeviceDetect();
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    console.warn('The Layout component from src/components/layout/index.tsx is deprecated. Please use DashboardLayout instead.');
  }, []);

  // Adjust padding based on device
  const containerPadding = isMobile 
    ? isLandscape ? 'px-4' : 'px-2' 
    : 'px-6';
  
  const verticalPadding = (isMobile && isLandscape) ? 'py-3' : 'py-6';

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${containerPadding}`}>
      <EnhancedHeader 
        theme={theme}
        onThemeToggle={toggleTheme}
        className="w-full"
      />
      <main className={`container mx-auto ${verticalPadding}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export { EnhancedHeader, Footer, DashboardLayout };
export default Layout;