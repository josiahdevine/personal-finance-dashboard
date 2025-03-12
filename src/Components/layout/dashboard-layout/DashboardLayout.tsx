import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { EnhancedSidebar } from '../../navigation/EnhancedSidebar';
import { EnhancedHeader } from '../EnhancedHeader';
import './DashboardLayout.css';
import { useTheme } from '../../../contexts/ThemeContext';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true
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
    <div className="dashboard-layout">
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
      
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {showHeader && (
          <EnhancedHeader 
            theme={theme}
            onThemeToggle={toggleTheme}
            className="dashboard-header"
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
    </div>
  );
};

export default DashboardLayout; 