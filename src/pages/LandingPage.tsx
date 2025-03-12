import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { EnhancedHeader } from '../components/layout/EnhancedHeader';
import EnhancedSidebar from '../components/navigation/EnhancedSidebar';
import { useAuth } from '../hooks/useAuth';
import { useMediaQuery } from '../hooks/useMediaQuery';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Set the mounted state to true after the component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Adjust sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Toggle sidebar collapsed state
  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Don't render anything until the component has mounted
  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <EnhancedSidebar 
        collapsed={collapsed} 
        onToggle={handleToggleSidebar}
        user={user}
        mobile={isMobile}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <EnhancedHeader 
          onMenuClick={handleToggleSidebar} 
          isSidebarCollapsed={collapsed}
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LandingPage; 