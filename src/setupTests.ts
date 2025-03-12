import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock Web Crypto API
const cryptoMock = {
  subtle: {
    generateKey: jest.fn(),
    exportKey: jest.fn(),
    importKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    deriveBits: jest.fn(),
    deriveKey: jest.fn(),
    digest: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    wrapKey: jest.fn(),
    unwrapKey: jest.fn(),
  },
  getRandomValues: jest.fn((buffer) => buffer),
  randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
} as unknown as Crypto;

global.crypto = cryptoMock;

// Mock fetch
global.fetch = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock window.matchMedia
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

// Mock requestAnimationFrame for animations/transitions
global.requestAnimationFrame = callback => setTimeout(callback, 0);

// Set a default test timeout
jest.setTimeout(10000);

// Console error suppression for specific React warnings (customize as needed)
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React warnings if needed
  const suppressedWarnings: string[] = [
    // Add warning message substrings to suppress here
    // Example: 'Warning: ReactDOM.render is no longer supported',
  ];
  
  if (suppressedWarnings.some(warning => typeof args[0] === 'string' && args[0].includes(warning))) {
    return;
  }
  
  originalConsoleError(...args);
};

// Mock axios
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => ({
  create: () => mockAxiosInstance,
  defaults: {
    baseURL: 'http://localhost:8888/.netlify/functions'
  },
})); 