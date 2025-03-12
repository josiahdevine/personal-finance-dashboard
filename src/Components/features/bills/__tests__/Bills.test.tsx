import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bills from '../index';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        id: '1',
        name: 'Rent',
        amount: 1500,
        dueDate: '2023-05-01',
        frequency: 'monthly',
        category: 'Housing',
        autoPay: true,
        reminderDays: 5,
        isPaid: false
      },
      {
        id: '2',
        name: 'Internet',
        amount: 80,
        dueDate: '2023-05-15',
        frequency: 'monthly',
        category: 'Utilities',
        autoPay: false,
        reminderDays: 3,
        isPaid: true
      }
    ])
  })
) as jest.Mock;

// Mock the BillForm component
jest.mock('../BillForm', () => ({
  __esModule: true,
  default: () => <div data-testid="bill-form">Bill Form Mock</div>
}));

// Mock the QueryClientProvider and hooks
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      {
        id: '1',
        name: 'Rent',
        amount: 1500,
        dueDate: '2023-05-01',
        frequency: 'monthly',
        category: 'Housing',
        autoPay: true,
        reminderDays: 5,
        isPaid: false
      },
      {
        id: '2',
        name: 'Internet',
        amount: 80,
        dueDate: '2023-05-15',
        frequency: 'monthly',
        category: 'Utilities',
        autoPay: false,
        reminderDays: 3,
        isPaid: true
      }
    ],
    isLoading: false,
    isError: false
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false
  }),
  QueryClient: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Bills Component', () => {
  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initially shows a loading state', () => {
    render(<Bills />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders bills after data is loaded', async () => {
    render(<Bills />);
    
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Check for the title
    await waitFor(() => {
      expect(screen.getByText('Bills Analysis')).toBeInTheDocument();
    });
    
    // Check for bill categories
    await waitFor(() => {
      expect(screen.getByText('Housing')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
    
    // Check for the Add Bill button
    await waitFor(() => {
      expect(screen.getByText('Add Bill', { selector: 'button' })).toBeInTheDocument();
    });
  });
}); 