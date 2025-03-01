import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import AuthenticatedHeader from '../AuthenticatedHeader';

// Mock the auth context and logger
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../utils/logger', () => ({
  log: jest.fn(),
  logError: jest.fn()
}));

describe('AuthenticatedHeader', () => {
  const mockUseAuth = useAuth;
  const mockToggleSidebar = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockClear();
    mockToggleSidebar.mockClear();
  });

  const renderHeader = (currentUser = { id: '1' }) => {
    mockUseAuth.mockReturnValue({
      currentUser,
      logout: jest.fn().mockResolvedValue(undefined)
    });

    return render(
      <MemoryRouter>
        <AuthenticatedHeader toggleSidebar={mockToggleSidebar} />
      </MemoryRouter>
    );
  };

  it('renders the logo/brand name', () => {
    renderHeader();
    expect(screen.getByText(/FinanceFlow/i)).toBeInTheDocument();
  });

  it('renders all navigation menu items', () => {
    renderHeader();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/Goals/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  it('handles sidebar toggle', () => {
    renderHeader();
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(toggleButton);
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('handles mobile menu toggle', () => {
    renderHeader();
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

    renderHeader();
    
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays correct active link styles', () => {
    renderHeader();
    const dashboardLink = screen.getByText(/Dashboard/i).closest('a');
    expect(dashboardLink).toHaveClass('text-indigo-600');
  });

  it('closes mobile menu when clicking a navigation link', () => {
    renderHeader();
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // Click a navigation link
    const dashboardLink = screen.getByText(/Dashboard/i);
    fireEvent.click(dashboardLink);
    
    // Menu should be closed
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
}); 