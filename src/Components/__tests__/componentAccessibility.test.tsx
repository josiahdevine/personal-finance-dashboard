import React from 'react';
import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from '../../utils/__tests__/testHelpers';

// Import components to test
import { SalaryJournal } from '../../pages/Dashboard/SalaryJournal';
import Dashboard from '../../pages/Dashboard/Dashboard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Setup component mocks
jest.mock('../../components/features/dashboard/Charts/IncomeExpenseChart', () => ({
  __esModule: true,
  default: () => <div data-testid="income-expense-chart">Income/Expense Chart</div>
}));

jest.mock('../../components/features/dashboard/Charts/SpendingCategoriesChart', () => ({
  __esModule: true,
  default: () => <div data-testid="spending-categories-chart">Spending Categories Chart</div>
}));

jest.mock('../../components/features/dashboard/TransactionList/TransactionList', () => ({
  __esModule: true,
  default: () => <div data-testid="transaction-list">Transaction List</div>
}));

// Mock required hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useAccounts');
jest.mock('../../hooks/useTransactions');
jest.mock('../../hooks/useBudgets');

describe('Component Accessibility Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('SalaryJournal Component', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = renderWithProviders(<SalaryJournal />, {
        providerProps: {
          initialRoute: '/dashboard/salary-journal',
          mockUser: true,
          mockTransactions: true
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders with proper aria attributes and keyboard navigation', () => {
      renderWithProviders(<SalaryJournal />, {
        providerProps: {
          initialRoute: '/dashboard/salary-journal',
          mockUser: true,
          mockTransactions: true
        }
      });
      
      // Check for headings
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for buttons having proper accessibility attributes
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Dashboard Component', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true,
          mockTransactions: true
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders with proper semantic HTML structure', () => {
      renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true,
          mockTransactions: true
        }
      });
      
      // Check for main content area
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Check for navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Check for chart sections
      expect(screen.getByTestId('income-expense-chart')).toBeInTheDocument();
      expect(screen.getByTestId('spending-categories-chart')).toBeInTheDocument();
      
      // Check for transaction list
      expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    });
  });

  // This test ensures that all of our forms maintain accessibility
  describe('Form Accessibility', () => {
    it('form controls have proper labels and ARIA attributes', () => {
      // We'll check the form controls within the Dashboard component
      renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true
        }
      });
      
      // Check all form fields
      const formFields = screen.getAllByRole('textbox');
      formFields.forEach(field => {
        // Each field should have an associated label or aria-label
        const hasLabel = field.hasAttribute('aria-label') || 
                         field.hasAttribute('aria-labelledby') || 
                         document.querySelector(`label[for="${field.id}"]`);
        
        expect(hasLabel).toBeTruthy();
      });

      // Check all buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have content or an aria-label
        const hasAccessibleName = button.textContent || 
                                 button.hasAttribute('aria-label');
        
        expect(hasAccessibleName).toBeTruthy();
      });
    });
  });

  // This test looks for common accessibility issues
  describe('Common Accessibility Checks', () => {
    it('images have alt text', () => {
      renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true
        }
      });
      
      // All images should have alt text
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('interactive elements are keyboard accessible', () => {
      renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true
        }
      });
      
      // All interactive elements should be focusable
      const interactiveElements = [
        ...Array.from(document.querySelectorAll('button')),
        ...Array.from(document.querySelectorAll('a')),
        ...Array.from(document.querySelectorAll('input')),
        ...Array.from(document.querySelectorAll('select')),
        ...Array.from(document.querySelectorAll('textarea')),
      ];
      
      interactiveElements.forEach(element => {
        // Either the element is naturally focusable or has tabIndex
        expect(element.getAttribute('tabIndex')).not.toBe('-1');
      });
    });

    it('color contrast meets WCAG standards', async () => {
      const { container } = renderWithProviders(<Dashboard />, {
        providerProps: {
          initialRoute: '/dashboard',
          mockUser: true,
          mockAccount: true
        }
      });
      
      // axe tests for color contrast issues
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
