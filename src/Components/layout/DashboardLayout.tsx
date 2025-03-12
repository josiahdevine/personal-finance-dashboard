import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useTimeFrame } from '../../contexts/TimeFrameContext';
import { useAuth } from '../../hooks/useAuth';
import type { TimeFrame } from '../../types/common';
import { EnhancedHeader } from './EnhancedHeader';
import { EnhancedSidebar } from '../navigation/EnhancedSidebar';
import { EnhancedFooter } from './EnhancedFooter';
import { AnimatePresence, motion } from 'framer-motion';
import type { ThemeMode } from '../../types/theme';

interface TimeFrameOption {
  label: string;
  value: TimeFrame;
}

const timeFrameOptions: TimeFrameOption[] = [
  { label: 'All Time', value: 'all' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

interface DashboardLayoutProps {
  children?: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean; 
  showFooter?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { timeFrame, setTimeFrame } = useTimeFrame();
  const { user } = useAuth();
  
  // State for responsive behavior
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Convert Theme from hooks/useTheme to ThemeMode
  const themeMode: ThemeMode = theme as unknown as ThemeMode;
  
  // Check if the theme is 'dark'
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto collapse sidebar on mobile
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const _toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 ${isDarkMode ? 'dark' : ''}`}>
      {showHeader && (
        <EnhancedHeader 
          theme={themeMode}
          onThemeToggle={toggleTheme}
          className="dashboard-header w-full"
        />
      )}
      
      <div className="flex flex-1 relative">
        {showSidebar && (
          <AnimatePresence mode="wait">
            <motion.aside
              key="sidebar"
              initial={{ width: sidebarCollapsed ? 70 : 240 }}
              animate={{ width: sidebarCollapsed ? 70 : 240 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className={`fixed h-[calc(100vh-4rem)] top-16 left-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md overflow-hidden`}
            >
              <EnhancedSidebar
                collapsed={sidebarCollapsed}
                onToggle={_toggleSidebar}
                user={user}
                mobile={isMobile}
                className={
                  isMobile 
                    ? `dashboard-sidebar-mobile ${sidebarCollapsed ? 'collapsed' : 'expanded'}` 
                    : `dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`
                }
              />
            </motion.aside>
          </AnimatePresence>
        )}

        <div className={`flex-1 flex flex-col min-h-screen ${showSidebar ? (sidebarCollapsed ? 'ml-[70px]' : 'ml-[240px]') : ''} transition-all duration-300`}>
          <main className="flex-grow p-4 md:p-6 mx-auto w-full max-w-7xl">
            {/* Timeframe selector */}
            {user && (
              <div className="mb-6 flex justify-center sm:justify-end">
                <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-gray-800 p-1">
                  {timeFrameOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFrame(option.value)}
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded-md
                        ${timeFrame === option.value 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {children || <Outlet />}
          </main>
          
          {showFooter && (
            <EnhancedFooter />
          )}
        </div>
      </div>
    </div>
  );
};