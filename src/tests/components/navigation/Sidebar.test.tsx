import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Sidebar } from '../../../components/navigation/Sidebar';
import { mockNavigationSections, mockUser } from '../../mocks/navigationMocks';
import { renderWithProviders, setupBrowserMocks } from '../../utils/test-utils';

// Set up browser mocks before tests
beforeAll(() => {
  setupBrowserMocks();
});

describe('Sidebar Component', () => {
  test('renders correctly with default props', () => {
    renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections} 
      />
    );
    
    // Verify that main navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    
    // Verify section headings
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    
    // Verify user information is displayed
    expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
  });

  test('toggles between collapsed and expanded states', () => {
    const onToggleMock = jest.fn();
    renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
        onToggle={onToggleMock}
      />
    );
    
    // Find the toggle button
    const toggleButton = screen.getByLabelText('Toggle Sidebar');
    
    // Click to collapse
    fireEvent.click(toggleButton);
    expect(onToggleMock).toHaveBeenCalledWith(true);
    
    // Reset mock and click again to expand
    onToggleMock.mockReset();
    fireEvent.click(toggleButton);
    expect(onToggleMock).toHaveBeenCalledWith(false);
  });

  test('displays badges correctly', () => {
    renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
      />
    );
    
    // Find items with badges
    const transactionsBadge = screen.getByText('5');
    const notificationsBadge = screen.getByText('3');
    
    // Verify badges are present
    expect(transactionsBadge).toBeInTheDocument();
    expect(notificationsBadge).toBeInTheDocument();
    
    // Check if badges have the appropriate styling based on class names
    // The badges have a specific class structure according to Sidebar.tsx
    expect(transactionsBadge.className).toContain('bg-primary');
    expect(transactionsBadge.className).toContain('text-primary-foreground');
    expect(transactionsBadge.className).toContain('rounded-full');
    
    expect(notificationsBadge.className).toContain('bg-primary');
    expect(notificationsBadge.className).toContain('text-primary-foreground');
    expect(notificationsBadge.className).toContain('rounded-full');
  });

  test('applies active styles to selected navigation item', () => {
    // Use location mock instead of activeItemId which doesn't exist in SidebarProps
    const mockLocation = { pathname: '/dashboard' };
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => mockLocation
    }));
    
    renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
      />
    );
    
    // Find the Dashboard nav item using proper testing-library methods
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    
    // Verify it has the active styles
    expect(dashboardLink).toHaveClass('bg-accent');
    expect(dashboardLink).toHaveClass('text-accent-foreground');
  });

  test('renders in mobile mode correctly', () => {
    renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
        mobile={true}
      />
    );
    
    // Verify mobile-specific styles
    const sidebarElement = screen.getByTestId('sidebar');
    expect(sidebarElement).toHaveClass('lg:hidden');
  });

  test('renders different variants correctly', () => {
    // Test minimal variant
    const { rerender } = renderWithProviders(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
        variant="minimal"
      />
    );
    
    // Verify minimal variant styling
    let sidebarElement = screen.getByTestId('sidebar');
    expect(sidebarElement).toHaveClass('bg-transparent');
    
    // Test floating variant
    rerender(
      <Sidebar 
        user={mockUser} 
        sections={mockNavigationSections}
        variant="floating"
      />
    );
    
    // Verify floating variant styling
    sidebarElement = screen.getByTestId('sidebar');
    expect(sidebarElement).toHaveClass('shadow-lg');
    expect(sidebarElement).toHaveClass('rounded-xl');
  });

  test('is accessible', async () => {
    const { container } = renderWithProviders(
      <Sidebar user={mockUser} sections={mockNavigationSections} />
    );
    
    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 