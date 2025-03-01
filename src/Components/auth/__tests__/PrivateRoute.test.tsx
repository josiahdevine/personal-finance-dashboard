import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import PrivateRoute from '../PrivateRoute';

// Mock the auth context
jest.mock('../../../contexts/AuthContext');

describe('PrivateRoute', () => {
  const mockUseAuth = useAuth as jest.Mock;
  
  // Test component to render inside PrivateRoute
  const TestComponent = () => <div>Protected Content</div>;
  
  // Helper function to render component with router
  const renderWithRouter = (user: any = null) => {
    mockUseAuth.mockReturnValue({ user });
    
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <TestComponent />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  it('renders children when user is authenticated', () => {
    renderWithRouter({ id: '1', email: 'test@example.com' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderWithRouter(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('preserves the redirect location in state', () => {
    renderWithRouter(null);
    const navigate = jest.fn();
    mockUseAuth.mockReturnValue({ user: null, navigate });
    
    expect(window.location.pathname).toBe('/login');
    expect(window.history.state).toEqual(
      expect.objectContaining({
        from: expect.objectContaining({ pathname: '/protected' })
      })
    );
  });
}); 