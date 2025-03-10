import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

// Use noop functions instead of empty objects
const toggleThemeNoop = (): void => {
  console.warn('toggleTheme was called before ThemeProvider was initialized');
};

const setDarkModeNoop = (): void => {
  console.warn('setDarkMode was called before ThemeProvider was initialized');
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: toggleThemeNoop,
  setDarkMode: setDarkModeNoop,
});

export const useTheme = (): ThemeContextType => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'financeApp_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = (): boolean => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      
      // Otherwise, check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Default to light mode when rendered on server
    return false;
  };
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme());
  
  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Save theme preference to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference in localStorage
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 