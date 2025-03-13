import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CommandMenu } from '../../../components/navigation/CommandMenu';
import { mockCommandGroups } from '../../mocks/navigationMocks';
import { renderWithProviders, setupBrowserMocks } from '../../utils/test-utils';

// Set up browser mocks before tests
beforeAll(() => {
  setupBrowserMocks();
});

describe('CommandMenu Component', () => {
  test('renders correctly with default props', () => {
    renderWithProviders(
      <CommandMenu defaultOpen={true} />
    );
    
    // Verify command dialog is rendered
    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    
    // Verify empty state displays correctly
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  test('handles keyboard shortcut correctly', async () => {
    const { baseElement } = renderWithProviders(
      <CommandMenu />
    );

    // Simulate pressing Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Wait for command dialog to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    });
    
    // Press Escape to close
    fireEvent.keyDown(baseElement, { key: 'Escape' });
    
    // Wait for command dialog to disappear
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Type a command or search...')).not.toBeInTheDocument();
    });
  });

  test('shows correct command groups based on authentication status', () => {
    renderWithProviders(
      <CommandMenu defaultOpen={true} />
    );
    
    // Check headings for authenticated user (default mock)
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
    
    // Check specific items only available to authenticated users
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('accepts and displays extra command groups', () => {
    const extraGroups = [
      {
        heading: "Custom Commands",
        items: [
          {
            id: "custom1",
            name: "Custom Command",
            icon: <span data-testid="custom-icon" />,
            keywords: ["custom"],
          }
        ]
      }
    ];

    renderWithProviders(
      <CommandMenu 
        defaultOpen={true} 
        extraGroups={extraGroups}
      />
    );
    
    // Verify custom group is rendered
    expect(screen.getByText('Custom Commands')).toBeInTheDocument();
    expect(screen.getByText('Custom Command')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  test('navigates when command item is selected', async () => {
    const navigateMock = jest.fn();
    
    // Mock the navigate function
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigateMock,
    }));

    renderWithProviders(
      <CommandMenu defaultOpen={true} />
    );
    
    // Find and click a navigation item
    const dashboardItem = screen.getByText('Dashboard');
    fireEvent.click(dashboardItem);
    
    // Verify navigation was triggered
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles custom actions when command item is selected', async () => {
    const customActionMock = jest.fn();
    const extraGroups = [
      {
        heading: "Custom Actions",
        items: [
          {
            id: "action1",
            name: "Custom Action",
            action: customActionMock,
          }
        ]
      }
    ];

    renderWithProviders(
      <CommandMenu 
        defaultOpen={true} 
        extraGroups={extraGroups}
      />
    );
    
    // Find and click the custom action item
    const actionItem = screen.getByText('Custom Action');
    fireEvent.click(actionItem);
    
    // Verify action was triggered
    await waitFor(() => {
      expect(customActionMock).toHaveBeenCalled();
    });
  });

  test('renders shortcut hints correctly', () => {
    renderWithProviders(
      <CommandMenu defaultOpen={true} />
    );
    
    // Find items with shortcuts
    const shortcuts = screen.getAllByRole('note');
    expect(shortcuts.length).toBeGreaterThan(0);
    
    // Check specific shortcuts are displayed
    expect(screen.getByText('D')).toBeInTheDocument(); // Dashboard shortcut
    expect(screen.getByText('P')).toBeInTheDocument(); // Profile shortcut
  });

  test('is accessible', async () => {
    const { baseElement } = renderWithProviders(
      <CommandMenu defaultOpen={true} />
    );
    
    // Test accessibility
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });
}); 