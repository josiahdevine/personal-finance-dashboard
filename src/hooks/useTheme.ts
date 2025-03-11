import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DisplayMode } from '../types/enums';

interface ThemeState {
  mode: DisplayMode;
  isDark: boolean;
}

/**
 * Hook for managing theme switching between light, dark, and system preferences
 * @returns Theme state and functions to control it
 */
export function useTheme() {
  const [theme, setTheme, removeTheme] = useLocalStorage<DisplayMode>(
    'theme',
    DisplayMode.SYSTEM
  );
  
  // Determine if the current theme is dark based on the theme setting and system preference
  const isDarkMode = (): boolean => {
    if (theme === DisplayMode.DARK) return true;
    if (theme === DisplayMode.LIGHT) return false;
    
    // If theme is system, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  // Current theme state
  const themeState: ThemeState = {
    mode: theme,
    isDark: isDarkMode()
  };
  
  // Set theme to light mode
  const setLightTheme = () => {
    setTheme(DisplayMode.LIGHT);
  };
  
  // Set theme to dark mode
  const setDarkTheme = () => {
    setTheme(DisplayMode.DARK);
  };
  
  // Set theme to follow system preference
  const setSystemTheme = () => {
    setTheme(DisplayMode.SYSTEM);
  };
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (isDarkMode()) {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  };
  
  // Reset theme to default (system)
  const resetTheme = () => {
    removeTheme();
  };
  
  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const isDark = isDarkMode();
      document.documentElement.classList.toggle('dark', isDark);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          isDark ? '#0f172a' : '#ffffff'
        );
      }
    };
    
    // Apply theme immediately
    applyTheme();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === DisplayMode.SYSTEM) {
        applyTheme();
      }
    };
    
    // Add listener with compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);
  
  return {
    theme: themeState,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    toggleTheme,
    resetTheme
  };
} 