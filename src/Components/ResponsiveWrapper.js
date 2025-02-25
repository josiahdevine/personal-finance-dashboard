import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isMobileDevice, onDeviceTypeChange } from '../utils/deviceDetection';
import MobileLayout from '../mobile/MobileLayout';
import { useSidebar } from '../App';
import { log, logError } from '../utils/logger';

/**
 * ResponsiveWrapper component that detects device type and renders appropriate layout
 * It determines whether to show the mobile or desktop version of the UI
 */
const ResponsiveWrapper = ({ children, desktopLayout: DesktopLayout }) => {
  // Initial detection of mobile vs desktop
  const [isMobile, setIsMobile] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();
  const sidebarContext = useSidebar();

  // Effect for initial device detection and listening for changes
  useEffect(() => {
    try {
      // Check device on initial load
      const checkDeviceType = () => {
        try {
          const mobile = isMobileDevice();
          log('ResponsiveWrapper', `Device detected as ${mobile ? 'mobile' : 'desktop'}`);
          setIsMobile(mobile);
          
          // If we're on desktop, make sure sidebar is visible
          if (!mobile && sidebarContext?.toggleSidebar) {
            sidebarContext.toggleSidebar(true); // Expand sidebar on desktop
          }
          
          setInitialCheckDone(true);
        } catch (err) {
          logError('ResponsiveWrapper', 'Error checking device type', err);
          // Default to desktop view if detection fails
          setIsMobile(false);
          setInitialCheckDone(true);
        }
      };
      
      // Do initial check
      checkDeviceType();
      
      // Set up listener for device changes (e.g. resize or orientation)
      const removeListener = onDeviceTypeChange((isMobile) => {
        log('ResponsiveWrapper', `Device type changed to ${isMobile ? 'mobile' : 'desktop'}`);
        setIsMobile(isMobile);
      });
      
      // Clean up
      return () => {
        if (removeListener) removeListener();
      };
    } catch (err) {
      logError('ResponsiveWrapper', 'Error in device detection effect', err);
      // Default to desktop view if detection fails
      setIsMobile(false);
      setInitialCheckDone(true);
    }
  }, [sidebarContext]);

  // Re-check when route changes (might be different layout requirements)
  useEffect(() => {
    try {
      const mobile = isMobileDevice();
      if (mobile !== isMobile) {
        log('ResponsiveWrapper', `Device type updated on route change: ${mobile ? 'mobile' : 'desktop'}`);
        setIsMobile(mobile);
      }
    } catch (err) {
      logError('ResponsiveWrapper', 'Error checking device type on route change', err);
    }
  }, [location.pathname, isMobile]);

  // If still doing initial check, show a minimal loading state
  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If mobile device, wrap with mobile layout
  if (isMobile) {
    log('ResponsiveWrapper', 'Rendering mobile layout');
    return <MobileLayout>{children}</MobileLayout>;
  }
  
  // Otherwise, use the provided desktop layout
  log('ResponsiveWrapper', 'Rendering desktop layout');
  return <DesktopLayout>{children}</DesktopLayout>;
};

export default ResponsiveWrapper; 