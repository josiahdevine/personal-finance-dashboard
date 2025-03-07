import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ThemeState = {
  theme: 'light',
  isDarkMode: false,
  isLoading: true,
  error: null
};

const ThemeContext = createContext<{
  state: ThemeState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
} | null>(null);

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        isDarkMode: action.payload === 'dark',
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

  const setTheme = useCallback((theme: Theme) => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      dispatch({ type: 'SET_THEME', payload: theme });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to set theme'
      });
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  }, [state.theme, setTheme]);

  const toggleDarkMode = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load theme preference'
      });
    }
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        state,
        setTheme,
        toggleTheme,
        toggleDarkMode
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
  
  // Return both the context and the theme property for backward compatibility
  return {
    ...context,
    theme: context.state.theme,
    isDarkMode: context.state.isDarkMode
  };
}; 