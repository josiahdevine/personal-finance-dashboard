import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import AuthenticatedHeader from '../AuthenticatedHeader';

// Mock the auth context and logger
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../utils/logger', () => ({
  log: jest.fn(),
  logError: jest.fn()
}));

describe('AuthenticatedHeader', () => {
  const mockLogout = jest.fn();
  const mockUser = {
    uid: '1',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });
  });

  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <AuthenticatedHeader />
      </BrowserRouter>
    );
  };

  it('renders the logo/brand name', () => {
    renderHeader();
    expect(screen.getByText(/FinanceFlow/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderHeader();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    renderHeader();
    
    // Get the mobile menu button by its aria-label
    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' });
    
    // Menu should be closed initially
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    
    // Open mobile menu
    fireEvent.click(menuButton);
    
    // Menu should be open
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Close mobile menu
    fireEvent.click(menuButton);
    
    // Menu should be closed
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('handles logout action', () => {
    renderHeader();
    const logoutButton = screen.getByText('Logout');
    
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays correct active link styles', () => {
    renderHeader();
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    // Set the current location to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // Force a re-render to update active styles
    renderHeader();
    
    expect(dashboardLink).toHaveClass('text-indigo-600');
  });

  it('closes mobile menu when clicking a navigation link', () => {
    renderHeader();
    
    // Get the mobile menu button by its aria-label
    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' });
    
    // Open mobile menu
    fireEvent.click(menuButton);
    
    // Click a navigation link
    const transactionsLink = screen.getByText('Transactions').closest('a');
    fireEvent.click(transactionsLink);
    
    // Menu should be closed
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
}); 