/**
 * Device detection utilities to determine if user is on mobile or desktop
 */

/**
 * Checks if current device is a mobile device
 * @returns {boolean} True if current device is mobile
 */
export const isMobileDevice = () => {
  // Guard against running in non-browser environments
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  // Check for mobile user agent patterns
  const userAgent = navigator.userAgent || '';
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check if viewport width is typical for mobile
  const isMobileWidth = window.innerWidth <= 768;
  
  // Log detection for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Device detection:', { 
      userAgent: userAgent.substring(0, 50) + '...',
      isMobileByUA: mobileRegex.test(userAgent),
      viewportWidth: window.innerWidth,
      isMobileWidth
    });
  }
  
  return mobileRegex.test(userAgent) || isMobileWidth;
};

/**
 * Checks if device is specifically iOS
 * @returns {boolean} True if current device is iOS
 */
export const isIOSDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const userAgent = navigator.userAgent || '';
  return /iPhone|iPad|iPod/i.test(userAgent);
};

/**
 * Checks if device is specifically Android
 * @returns {boolean} True if current device is Android
 */
export const isAndroidDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const userAgent = navigator.userAgent || '';
  return /Android/i.test(userAgent);
};

/**
 * Registers a listener for device type changes (like orientation changes on tablets)
 * @param {Function} callback Function to call when device type might have changed
 * @returns {Function} Function to remove the listener
 */
export const onDeviceTypeChange = (callback) => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  // Set up resize listener
  const handleResize = () => {
    callback(isMobileDevice());
  };
  
  window.addEventListener('resize', handleResize);
  
  // Return function to remove listener
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Gets current orientation of the device
 * @returns {'portrait'|'landscape'} Current orientation
 */
export const getDeviceOrientation = () => {
  if (typeof window === 'undefined') {
    return 'portrait'; // Default for SSR
  }
  
  if (window.screen && window.screen.orientation) {
    return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }
  
  // Fallback for browsers that don't support screen.orientation
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}; 