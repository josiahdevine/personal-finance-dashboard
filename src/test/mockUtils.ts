import React from 'react';

/**
 * Utility functions for mocking contexts, services, and other dependencies in tests
 */

/**
 * Mocks the theme context with specified values
 * @param theme - The theme to set ('light', 'dark', or 'system')
 * @returns The mocked ThemeContext values
 */
export const mockThemeContext = (theme: 'light' | 'dark' | 'system' = 'light') => {
  const setTheme = jest.fn();
  const toggleTheme = jest.fn();
  
  const mockContext = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isSystem: theme === 'system',
  };
  
  jest.mock('../context/ThemeContext', () => ({
    useTheme: () => mockContext,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children
  }));
  
  return mockContext;
};

/**
 * Mocks the authentication context
 * @param isAuthenticated - Whether the user is authenticated
 * @param user - The user object to return
 * @returns The mocked AuthContext values
 */
export const mockAuthContext = (isAuthenticated = false, user = { id: 'test-user', email: 'test@example.com' }) => {
  const login = jest.fn();
  const logout = jest.fn();
  const register = jest.fn();
  
  const mockContext = {
    isAuthenticated,
    user: isAuthenticated ? user : null,
    login,
    logout,
    register,
    loading: false,
    error: null,
  };
  
  jest.mock('../context/AuthContext', () => ({
    useAuth: () => mockContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children
  }));
  
  return mockContext;
};

/**
 * Mocks formatting functions
 * @param options - Options for the formatters
 * @returns The mocked formatters
 */
export const mockFormatters = (options = {}) => {
  const formatCurrency = jest.fn().mockImplementation((value: number) => 
    `$${value.toFixed(2)}`
  );
  
  const formatPercentage = jest.fn().mockImplementation((value: number) => 
    `${(value * 100).toFixed(2)}%`
  );
  
  return {
    formatCurrency,
    formatPercentage,
  };
};

/**
 * Resets all mocks created during tests
 */
export const resetAllMocks = () => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
};

/**
 * Mocks window.matchMedia for testing media queries
 */
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}; 