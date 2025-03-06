import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import App from './App';

// Mock environment variables
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
process.env.REACT_APP_FIREBASE_APP_ID = 'test-app-id';
process.env.REACT_APP_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Mock test environment
process.env.NODE_ENV = 'test';

// Custom render function that includes all necessary providers
const renderWithProviders = async (component, { route = '/' } = {}) => {
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  // Wait for initial render to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  return view;
};

// Test the root route redirect
describe('App Root Route', () => {
  it('should redirect to landing page when not authenticated', async () => {
    await renderWithProviders(<App />, { route: '/' });
    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });

  it('should redirect to dashboard when authenticated', async () => {
    // Mock authenticated state
    const mockAuth = getAuth();
    mockAuth.currentUser = { uid: 'test-uid' };
    
    await renderWithProviders(<App />, { route: '/' });
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});

// Test protected routes
describe('Protected Routes', () => {
  it('should redirect to login when accessing protected route while not authenticated', async () => {
    await renderWithProviders(<App />, { route: '/dashboard' });
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should render protected route when authenticated', async () => {
    // Mock authenticated state
    const mockAuth = getAuth();
    mockAuth.currentUser = { uid: 'test-uid' };
    
    await renderWithProviders(<App />, { route: '/dashboard' });
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});

// Test public routes
describe('Public Routes', () => {
  it('should render landing page', async () => {
    await renderWithProviders(<App />, { route: '/landing' });
    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });

  it('should render login page', async () => {
    await renderWithProviders(<App />, { route: '/login' });
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should render register page', async () => {
    await renderWithProviders(<App />, { route: '/register' });
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });
  });
});

test('renders learn react link', () => {
  const view = render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
