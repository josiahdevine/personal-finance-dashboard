import '@testing-library/jest-dom';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveClass: (className: string) => R;
      toBeInTheDocument: () => R;
      toBeDisabled: () => R;
      toHaveTextContent: (text: string) => R;
    }
  }
} 