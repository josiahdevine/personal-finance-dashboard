import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
}

const defaultToggleFunction = () => console.warn('ThemeContext not initialized');

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: defaultToggleFunction,
  toggleDarkMode: defaultToggleFunction,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleDarkMode = () => {
    toggleTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 