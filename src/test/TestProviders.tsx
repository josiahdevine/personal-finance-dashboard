import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

// Create mock object for theme context
const mockTheme = {
  theme: 'light',
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

// Create mock object for auth context
const mockAuth = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  firebaseUser: null,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  signInWithGoogle: jest.fn(),
  signInWithEmail: jest.fn(),
  createUserWithEmail: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  clearError: jest.fn(),
};

// Create any other mock contexts needed for testing

interface TestProvidersProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  authenticated?: boolean;
}

/**
 * A wrapper component that provides all necessary context providers for testing
 */
export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  theme = 'light',
  authenticated = false,
}) => {
  // Mock window.matchMedia for tests
  if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
  }

  // Create custom mocks for providers based on props
  const authContextValue = {
    ...mockAuth,
    isAuthenticated: authenticated,
  };

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

/**
 * Custom render function that wraps the component with test providers
 * @param ui - The React component to render
 * @param options - Additional render options including provider props
 * @returns The rendered component with all the testing library utilities
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    providerProps?: {
      theme?: 'light' | 'dark' | 'system';
      authenticated?: boolean;
    };
  }
) => {
  const { providerProps, ...renderOptions } = options || {};
  
  return render(
    <TestProviders
      theme={providerProps?.theme}
      authenticated={providerProps?.authenticated}
    >
      {ui}
    </TestProviders>,
    renderOptions
  );
};

/**
 * Export mock objects for direct use in tests if needed
 */
export const mocks = {
  theme: mockTheme,
  auth: mockAuth,
}; 