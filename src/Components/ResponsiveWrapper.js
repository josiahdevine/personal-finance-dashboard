import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isMobileDevice, onDeviceTypeChange } from '../utils/deviceDetection';
import MobileLayout from '../mobile/MobileLayout';
import { useSidebar } from '../App';

/**
 * ResponsiveWrapper component that detects device type and renders appropriate layout
 * It determines whether to show the mobile or desktop version of the UI
 */
const ResponsiveWrapper = ({ children, desktopLayout: DesktopLayout }) => {
  // Initial detection of mobile vs desktop
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  // Effect for initial device detection and listening for changes
  useEffect(() => {
    // Check device on initial load
    const checkDeviceType = () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      
      // If we're on desktop, make sure sidebar is visible
      if (!mobile && toggleSidebar) {
        toggleSidebar(true); // Expand sidebar on desktop
      }
    };
    
    // Do initial check
    checkDeviceType();
    
    // Set up listener for device changes (e.g. resize or orientation)
    const removeListener = onDeviceTypeChange((isMobile) => {
      setIsMobile(isMobile);
    });
    
    // Clean up
    return () => {
      if (removeListener) removeListener();
    };
  }, [toggleSidebar]);

  // Re-check when route changes (might be different layout requirements)
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, [location.pathname]);

  // If mobile device, wrap with mobile layout
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }
  
  // Otherwise, use the provided desktop layout
  return <DesktopLayout>{children}</DesktopLayout>;
};

export default ResponsiveWrapper; 