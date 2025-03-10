import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ThemeState = {
  theme: 'system',
  isDarkMode: false,
  isLoading: true,
  error: null
};

interface ThemeContextType {
  state: ThemeState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        isLoading: false
      };
    case 'SET_DARK_MODE':
      return {
        ...state,
        isDarkMode: action.payload,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply dark mode to the document
  const applyDarkMode = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    dispatch({ type: 'SET_DARK_MODE', payload: isDark });
  }, []);

  // Handle system preference change
  const handleSystemPreferenceChange = useCallback((e: MediaQueryListEvent) => {
    if (state.theme === 'system') {
      applyDarkMode(e.matches);
    }
  }, [state.theme, applyDarkMode]);

  // Set theme
  const setTheme = useCallback((theme: Theme) => {
    try {
      localStorage.setItem('theme', theme);
      dispatch({ type: 'SET_THEME', payload: theme });
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyDarkMode(prefersDark);
      } else {
        applyDarkMode(theme === 'dark');
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to set theme'
      });
    }
  }, [applyDarkMode]);

  const toggleTheme = useCallback(() => {
    if (state.theme === 'system') {
      setTheme(state.isDarkMode ? 'light' : 'dark');
    } else {
      setTheme(state.theme === 'light' ? 'dark' : 'light');
    }
  }, [state.theme, state.isDarkMode, setTheme]);

  const toggleDarkMode = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Initialize theme on component mount
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        setTheme('system');
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load theme preference'
      });
    }
  }, [setTheme]);

  // Add listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern API (addEventListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemPreferenceChange);
      return () => mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
    } 
    // Deprecated API (addListener) for older browsers
    else if ('addListener' in mediaQuery) {
      mediaQuery.addListener(handleSystemPreferenceChange);
      return () => mediaQuery.removeListener(handleSystemPreferenceChange);
    }
    
    return undefined;
  }, [handleSystemPreferenceChange]);

  return (
    <ThemeContext.Provider
      value={{
        state,
        setTheme,
        toggleTheme,
        toggleDarkMode,
        isDarkMode: state.isDarkMode,
        theme: state.theme
      }}
    >
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