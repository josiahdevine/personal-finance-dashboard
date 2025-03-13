import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import EnhancedSidebar from '../../navigation/EnhancedSidebar';
import { EnhancedHeader } from '../EnhancedHeader';
import './DashboardLayout.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { CommandMenu } from '../../navigation/CommandMenu';
import { cn } from '../../../lib/utils';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showCommandMenu?: boolean;
  className?: string;
  contentClassName?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
  showCommandMenu = true,
  className,
  contentClassName
}) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={cn("dashboard-layout", className)}>
      {showSidebar && (
        <EnhancedSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          className={
            isMobile 
              ? `dashboard-sidebar-mobile ${sidebarCollapsed ? 'collapsed' : 'expanded'}` 
              : 'dashboard-sidebar'
          }
          user={user as any}
        />
      )}
      
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${contentClassName}`}>
        {showHeader && (
          <EnhancedHeader 
            theme={theme}
            onThemeToggle={toggleTheme}
            onMenuClick={toggleSidebar}
            className="dashboard-header"
            showThemeToggle={true}
            showSearchCommand={true}
          />
        )}
        
        <main className="dashboard-main">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="dashboard-backdrop"
          onClick={toggleSidebar}
        />
      )}

      {/* Global Command Menu */}
      {showCommandMenu && <CommandMenu />}
    </div>
  );
};

export default DashboardLayout; 