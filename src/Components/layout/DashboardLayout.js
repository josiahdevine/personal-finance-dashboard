import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

/**
 * Main dashboard layout component that wraps all dashboard pages
 * 
 * @component
 * @example
 * ```jsx
 * <DashboardLayout>
 *   <DashboardOverview />
 * </DashboardLayout>
 * ```
 */
const DashboardLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobileView]);
  
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        isMobileView={isMobileView} 
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Mobile overlay - only visible when sidebar is open on mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-10 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main content area */}
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarOpen && !isMobileView ? 'ml-64' : 'ml-0'
      } pt-16`}>
        {/* Outlet renders the child route component */}
        <Outlet />
      </main>
      
      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

DashboardLayout.propTypes = {};

export default DashboardLayout; 