import React from 'react';
import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SalaryJournal } from '../../pages/Dashboard/SalaryJournal';
import { renderWithProviders, typeValidators } from '../../utils/__tests__/testHelpers';

// Add custom matchers
expect.extend(toHaveNoViolations);

// Mock hooks to provide necessary data - we've moved most generic mocking to testHelpers
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useAccounts');
jest.mock('../../hooks/useTransactions');

describe('Accessibility Tests - SalaryJournal', () => {
  beforeEach(() => {
    // We don't need to configure the mocks here anymore as that's handled by our testHelpers
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('SalaryJournal component meets WCAG standards', async () => {
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
  
  it('renders the salary journal header', () => {
    renderWithProviders(<SalaryJournal />, {
      providerProps: {
        initialRoute: '/dashboard/salary-journal',
        mockUser: true,
        mockTransactions: true
      }
    });
    
    // Basic check for the heading - adjust selector based on actual component
    expect(screen.getByText(/salary journal/i)).toBeInTheDocument();
  });

  it('validates financial data through type guards', () => {
    // Testing that our type validators are working correctly
    const mockTransaction = {
      id: 'transaction-1',
      date: new Date().toISOString(),
      amount: 1500,
      type: 'income',
      description: 'Test transaction',
      status: 'completed'
    };

    // Use our imported validators to check the mock data
    expect(typeValidators.isUUID(mockTransaction.id)).toBeTruthy();
    expect(typeValidators.isISO8601DateTime(mockTransaction.date)).toBeTruthy();
    expect(typeValidators.isTransactionType(mockTransaction.type)).toBeTruthy();
    expect(typeValidators.isTransactionStatus(mockTransaction.status)).toBeTruthy();
  });
});
