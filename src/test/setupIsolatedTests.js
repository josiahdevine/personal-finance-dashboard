/**
 * Setup file for isolated component tests
 */

// Add testing library's custom matchers
import '@testing-library/jest-dom';

// Mock formatters
jest.mock('../utils/formatters', () => ({
  formatCurrency: jest.fn((value) => `$${value}`),
  formatPercentage: jest.fn((value) => `${value}%`),
  formatNumber: jest.fn((value) => `${value}`),
  formatDate: jest.fn((date) => date.toString()),
}));

// Mock theme context
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', toggleTheme: jest.fn() })),
}));

// Mock auth context
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ 
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  })),
}));

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test teardown
afterAll(() => {
  // Add any global teardown here
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 