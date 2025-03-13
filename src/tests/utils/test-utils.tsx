import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';

/**
 * Custom wrapper that provides common context providers for testing
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withTheme?: boolean;
  withAuth?: boolean;
}

/**
 * Custom render function that wraps the component with necessary providers
 * 
 * @param ui - The component to render
 * @param options - Custom render options
 * @returns The rendered component with all the testing utilities
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    withRouter = true,
    withTheme = true,
    withAuth = true,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult {
  // Create a wrapper component with all the providers
  function Wrapper({ children }: { children: React.ReactNode }) {
    let content = children;

    // Add Auth provider if requested
    if (withAuth) {
      content = (
        <AuthProvider>
          {content}
        </AuthProvider>
      );
    }

    // Add Theme provider if requested
    if (withTheme) {
      content = (
        <ThemeProvider>
          {content}
        </ThemeProvider>
      );
    }

    // Add Router if requested
    if (withRouter) {
      content = <BrowserRouter>{content}</BrowserRouter>;
    }

    return <>{content}</>;
  }

  // Return the rendered component
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mocks the window.matchMedia function for tests involving media queries
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Creates a mock ResizeObserver for testing responsive components
 */
export function mockResizeObserver() {
  class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }

  window.ResizeObserver = MockResizeObserver as any;
}

/**
 * Sets up all required browser mocks for UI component testing
 */
export function setupBrowserMocks() {
  mockMatchMedia();
  mockResizeObserver();
  
  // Mock window.scrollTo
  window.scrollTo = jest.fn();
  
  // Mock IntersectionObserver
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
} 