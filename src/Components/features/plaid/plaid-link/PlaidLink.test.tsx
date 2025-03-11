import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaidLinkButton } from './index';

// Mock the auth context
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Mock the theme context
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    isDarkMode: false
  })
}));

describe('PlaidLinkButton', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button when ready', () => {
    render(
      <PlaidLinkButton onSuccess={mockOnSuccess} />
    );

    expect(screen.getByText('Connect Bank Account')).toBeInTheDocument();
  });

  it('shows loading state when connecting', async () => {
    render(
      <PlaidLinkButton onSuccess={mockOnSuccess} />
    );

    const button = screen.getByText('Connect Bank Account');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PlaidLinkButton onSuccess={mockOnSuccess} />
    );

    // Simulate an error
    const error = new Error('Failed to initialize Plaid');
    console.error(error);

    await waitFor(() => {
      expect(screen.getByText(/Failed to initialize Plaid/)).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
}); 