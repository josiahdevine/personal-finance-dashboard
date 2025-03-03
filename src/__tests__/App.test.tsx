import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    resetPassword: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    
    // Basic assertion to ensure the component renders
    expect(screen).toBeDefined();
  });
}); 