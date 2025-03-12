import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useTimeFrame } from '../../contexts/TimeFrameContext';
import { useAuth } from '../../hooks/useAuth';
import type { TimeFrame } from '../../types/common';
import { EnhancedHeader } from './EnhancedHeader';
import EnhancedSidebar from '../navigation/EnhancedSidebar';
import { EnhancedFooter } from './EnhancedFooter';
import { AnimatePresence, motion } from 'framer-motion';
import type { ThemeMode } from '../../types/theme';
import { validateUser } from '../../types/guards';

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
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const themeMode: ThemeMode = theme as unknown as ThemeMode;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Validate user object before passing to components
  const validUser = user && validateUser(user) ? user : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {showHeader && (
        <EnhancedHeader 
          theme={themeMode}
          onThemeToggle={toggleTheme}
          className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          onMenuClick={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />
      )}
      
      <div className="flex flex-1 pt-16">
        {showSidebar && (
          <AnimatePresence mode="wait">
            <motion.aside
              key="sidebar"
              initial={{ width: sidebarCollapsed ? 70 : 240 }}
              animate={{ width: sidebarCollapsed ? 70 : 240 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed h-[calc(100vh-4rem)] top-16 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
            >
              <EnhancedSidebar
                className="h-full"
                user={validUser}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                mobile={isMobile}
              />
            </motion.aside>
          </AnimatePresence>
        )}
        
        <main className={`flex-1 min-h-[calc(100vh-4rem)] ${showSidebar ? (sidebarCollapsed ? 'ml-[70px]' : 'ml-[240px]') : ''} transition-all duration-300`}>
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {validUser && (
              <div className="mb-6 flex justify-end">
                <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-gray-800 p-1">
                  {timeFrameOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFrame(option.value)}
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded-md
                        ${timeFrame === option.value 
                          ? 'bg-primary text-primary-foreground' 
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
          </div>
        </main>
      </div>
      
      {showFooter && (
        <EnhancedFooter className="mt-auto" />
      )}
    </div>
  );
};