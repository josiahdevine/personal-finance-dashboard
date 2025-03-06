import { useMediaQuery } from 'react-responsive';

/**
 * Custom hook for device detection and responsive design
 * 
 * This hook provides a set of boolean flags that can be used to determine
 * the current device type (mobile, tablet, desktop) and make responsive UI decisions.
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 * - Large Desktop: >= 1440px
 * 
 * @returns Object containing boolean flags for different device types
 */
export const useDeviceDetect = () => {
  // Device type detection based on screen width
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1440 });

  // Orientation detection
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isLandscape = useMediaQuery({ orientation: 'landscape' });

  return {
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Touch capability
    isTouch: isMobile || isTablet,
    
    // Orientation
    isPortrait,
    isLandscape,
  };
};

export default useDeviceDetect; 