/**
 * Device detection utilities to determine if user is on mobile or desktop
 */

/**
 * Checks if current device is a mobile device
 * @returns {boolean} True if current device is mobile
 */
export const isMobileDevice = () => {
  // Check for mobile user agent patterns
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check if viewport width is typical for mobile
  const isMobileWidth = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || isMobileWidth;
};

/**
 * Checks if device is specifically iOS
 * @returns {boolean} True if current device is iOS
 */
export const isIOSDevice = () => {
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(userAgent);
};

/**
 * Checks if device is specifically Android
 * @returns {boolean} True if current device is Android
 */
export const isAndroidDevice = () => {
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  return /Android/i.test(userAgent);
};

/**
 * Registers a listener for device type changes (like orientation changes on tablets)
 * @param {Function} callback Function to call when device type might have changed
 * @returns {Function} Function to remove the listener
 */
export const onDeviceTypeChange = (callback) => {
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
  if (window.screen && window.screen.orientation) {
    return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }
  
  // Fallback for browsers that don't support screen.orientation
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}; 