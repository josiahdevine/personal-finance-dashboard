import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import PublicNavbar from '../PublicNavbar';

// Mock the auth context
jest.mock('../../../contexts/AuthContext');

describe('PublicNavbar', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockClear();
    mockNavigate.mockClear();
  });

  const renderNavbar = (currentUser: any = null) => {
    mockUseAuth.mockReturnValue({
      currentUser,
      logout: jest.fn().mockResolvedValue(undefined)
    });

    return render(
      <MemoryRouter>
        <PublicNavbar />
      </MemoryRouter>
    );
  };

  it('renders the logo/brand name', () => {
    renderNavbar();
    expect(screen.getByText(/FinanceFlow/i)).toBeInTheDocument();
  });

  it('shows login/register links when user is not authenticated', () => {
    renderNavbar();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('shows logout button when user is authenticated', () => {
    renderNavbar({ id: '1', email: 'test@example.com' });
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    renderNavbar();
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Menu should be closed initially
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    
    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(menuButton);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('handles logout action', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      currentUser: { id: '1' },
      logout: mockLogout
    });

    renderNavbar({ id: '1' });
    
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays correct active link styles', () => {
    renderNavbar();
    const homeLink = screen.getByText(/Home/i);
    expect(homeLink).toHaveClass('text-gray-900'); // Active link class
  });
}); 