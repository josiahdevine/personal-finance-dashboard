import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';

// Wrapper to provide all necessary context providers for tests
export const AllProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock context values
  const mockTheme = {
    theme: 'light',
    toggleTheme: jest.fn(),
  };

  const mockAuth = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    loading: false,
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  };

  // Wrap the component with all necessary context providers
  return (
    <div data-testid="test-wrapper">
      {/* Add your context providers here as needed */}
      {children}
    </div>
  );
};

// Custom render function that includes the providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  return render(ui, { wrapper: AllProviders, ...options });
}; 