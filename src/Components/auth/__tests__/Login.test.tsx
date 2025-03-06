import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { AuthProvider } from '../../../context/AuthContext';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders login form', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid credentials', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      })
    );

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('successfully logs in with valid credentials', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'demo@personalfinance.com' } });
    fireEvent.change(passwordInput, { target: { value: 'demo123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'demo@personalfinance.com' } });
    fireEvent.change(passwordInput, { target: { value: 'demo123' } });
    fireEvent.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('shows password requirements error', async () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('navigates to registration page', () => {
    renderLogin();
    
    const registerLink = screen.getByText(/create a new account/i);
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('navigates to forgot password page', () => {
    renderLogin();
    
    const forgotPasswordLink = screen.getByText(/forgot your password/i);
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });
}); 