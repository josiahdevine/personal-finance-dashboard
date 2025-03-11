import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaidLink } from '../PlaidLink';
import { AuthProvider } from '../../../contexts/AuthContext';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock the Plaid Link component
jest.mock('react-plaid-link', () => ({
  usePlaidLink: jest.fn(() => ({
    open: jest.fn(),
    ready: true,
    error: null,
  })),
}));

const renderPlaidLink = () => {
  return render(
    <AuthProvider>
      <PlaidLink onSuccess={jest.fn()} />
    </AuthProvider>
  );
};

describe('PlaidLink Component', () => {
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  it('renders connect bank button', () => {
    renderPlaidLink();
    expect(screen.getByRole('button', { name: /connect your bank/i })).toBeInTheDocument();
  });

  it('shows loading state while creating link token', async () => {
    server.use(
      http.post('/api/plaid/create-link-token', () => {
        return HttpResponse.json(
          { link_token: 'test-link-token' },
          { status: 200 }
        );
      })
    );

    renderPlaidLink();
    expect(screen.getByText(/connecting to plaid/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/connecting to plaid/i)).not.toBeInTheDocument();
    });
  });

  it('shows error message when link token creation fails', async () => {
    server.use(
      http.post('/api/plaid/create-link-token', () => {
        return HttpResponse.json(
          { message: 'Failed to create link token' },
          { status: 500 }
        );
      })
    );

    renderPlaidLink();

    await waitFor(() => {
      expect(screen.getByText(/error connecting to plaid/i)).toBeInTheDocument();
    });
  });

  it('handles successful bank connection', async () => {
    const mockOnSuccess = jest.fn();
    server.use(
      http.post('/api/plaid/exchange-public-token', () => {
        return HttpResponse.json(
          { access_token: 'test-access-token' },
          { status: 200 }
        );
      })
    );

    render(
      <AuthProvider>
        <PlaidLink onSuccess={mockOnSuccess} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when bank connection fails', async () => {
    server.use(
      http.post('/api/plaid/exchange-public-token', () => {
        return HttpResponse.json(
          { message: 'Failed to exchange public token' },
          { status: 400 }
        );
      })
    );

    renderPlaidLink();

    await waitFor(() => {
      expect(screen.getByText(/error connecting your bank account/i)).toBeInTheDocument();
    });
  });

  it('disables button during processing', async () => {
    renderPlaidLink();
    const connectButton = screen.getByRole('button', { name: /connect your bank/i });
    expect(connectButton).toBeDisabled();

    await waitFor(() => {
      expect(connectButton).not.toBeDisabled();
    });
  });
}); 