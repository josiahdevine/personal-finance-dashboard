import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Sidebar from '../../navigation/sidebar/Sidebar';
import Header from '../header/Header';
import './DashboardLayout.css';

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
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          className={
            isMobile 
              ? `dashboard-sidebar-mobile ${sidebarCollapsed ? 'collapsed' : 'expanded'}` 
              : 'dashboard-sidebar'
          }
          user={user}
        />
      )}
      
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {showHeader && (
          <Header 
            toggleSidebar={toggleSidebar} 
            sidebarCollapsed={sidebarCollapsed}
            isMobile={isMobile}
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