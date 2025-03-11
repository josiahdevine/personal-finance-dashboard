import '@testing-library/jest-dom';

// Mock the window.matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock HTMLElement.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Add custom console overrides for testing
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore React-specific errors related to act()
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: An update to Component inside a test was not wrapped in act',
    'Warning: findDOMNode is deprecated in StrictMode',
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
  // Reset any request mocks
  jest.clearAllMocks();
}); 