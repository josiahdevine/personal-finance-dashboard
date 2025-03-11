import '@testing-library/jest-dom';
import React from 'react';

// Mock all context providers to return default values
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
    isSystem: false,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}), { virtual: true });

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    loading: false,
    error: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}), { virtual: true });

// Simplified mocks to avoid JSX in TypeScript files
jest.mock('@headlessui/react', () => {
  const actual = jest.requireActual('@headlessui/react');
  return {
    ...actual,
    Transition: ({ show, children }: any) => {
      return show ? children : null;
    },
    Dialog: ({ open, onClose, children }: any) => {
      if (!open) return null;
      
      const content = typeof children === 'function' 
        ? children({ open }) 
        : children;
        
      return {
        type: 'div',
        props: {
          role: 'dialog',
          'aria-modal': 'true',
          children: content
        }
      };
    },
  };
}, { virtual: true });

// Mock window APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
  
  constructor(callback: IntersectionObserverCallback) {
    // Nothing needed here
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  
  constructor(callback: ResizeObserverCallback) {
    // Nothing needed here
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Suppress specific console errors that are not relevant to tests
const originalConsoleError = console.error;
console.error = (...args) => {
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: An update to Component inside a test was not wrapped in act',
    'Error: Not implemented: navigation',
    'Warning: An update to TransitionChildFn inside a test was not wrapped in act',
    'Warning: An update to TransitionRootFn inside a test was not wrapped in act',
    'Warning: An update to Dialog inside a test was not wrapped in act',
  ];
  
  const isSupressedError = suppressedWarnings.some(
    warning => args[0] && typeof args[0] === 'string' && args[0].includes(warning)
  );
  
  if (!isSupressedError) {
    originalConsoleError(...args);
  }
};

// Global afterEach cleanup
afterEach(() => {
  jest.clearAllMocks();
}); 