import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaidLinkButton } from './index';
import { AuthProvider } from '../../contexts/AuthContext';

describe('PlaidLinkButton', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button when ready', () => {
    render(
      <AuthProvider>
        <PlaidLinkButton onSuccess={mockOnSuccess} />
      </AuthProvider>
    );

    expect(screen.getByText('Connect Bank Account')).toBeInTheDocument();
  });

  it('shows loading state when connecting', async () => {
    render(
      <AuthProvider>
        <PlaidLinkButton onSuccess={mockOnSuccess} />
      </AuthProvider>
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
      <AuthProvider>
        <PlaidLinkButton onSuccess={mockOnSuccess} />
      </AuthProvider>
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