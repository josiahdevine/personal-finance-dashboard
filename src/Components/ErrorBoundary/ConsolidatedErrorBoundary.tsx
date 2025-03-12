import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ApiError } from '../../services/api';

/**
 * Consolidated ErrorBoundary component
 * 
 * Features:
 * - Catches and displays runtime errors
 * - Prevents app crashes from component errors
 * - Dark mode support
 * - Detailed error information for development
 * - Simplified error messages for production
 * - Support for API error handling
 * - Custom fallback component support
 * - Error callback support
 */

interface ErrorMessage {
  title: string;
  description: string | React.ReactNode;
}

interface Props {
  children: ReactNode;
  componentName?: string;
  showDetails?: boolean;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error fallback component to display when an error occurs
const ErrorFallback = ({ 
  error, 
  errorInfo, 
  isDarkMode, 
  componentName,
  className = '',
  showDetails = process.env.NODE_ENV === 'development' 
}: { 
  error: Error | null; 
  errorInfo: ErrorInfo | null; 
  isDarkMode: boolean;
  componentName?: string;
  className?: string;
  showDetails?: boolean;
}) => {
  const isApiError = error instanceof ApiError;
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } ${className}`}>
      <div className={`w-full max-w-2xl rounded-lg shadow-lg p-8 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center mb-6">
          <svg
            className={`w-10 h-10 mr-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold">
            {isApiError ? 'API Error' : componentName ? `Error in ${componentName}` : 'Application Error'}
          </h1>
        </div>

        <div className={`p-4 mb-6 rounded ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <h2 className="font-semibold mb-2">
            {isApiError ? 'The server responded with an error:' : 'Something went wrong:'}
          </h2>
          <p className={`${isDarkMode ? 'text-red-300' : 'text-red-600'} font-mono`}>
            {error?.message || 'Unknown error'}
          </p>
        </div>

        {showDetails && errorInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Component Stack:</h3>
            <pre className={`p-3 rounded overflow-auto text-sm font-mono ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
            }`} style={{ maxHeight: '200px' }}>
              {errorInfo.componentStack}
            </pre>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-800' 
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            }`}
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reload Page
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper to provide theme context to the class component
const ErrorBoundaryWithTheme = (props: Props) => {
  const { isDarkMode } = useTheme();
  return <ErrorBoundaryClass {...props} isDarkMode={isDarkMode} />;
};

// Main error boundary implementation
class ErrorBoundaryClass extends Component<Props & { isDarkMode: boolean }, State> {
  constructor(props: Props & { isDarkMode: boolean }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  getErrorMessage(): ErrorMessage {
    const { error } = this.state;
    const { componentName } = this.props;
    
    if (!error) {
      return {
        title: 'Unknown Error',
        description: 'An unknown error has occurred.',
      };
    }

    if (this.isApiError(error)) {
      return {
        title: 'API Error',
        description: `The server responded with an error: ${error.message}`,
      };
    }

    return {
      title: componentName ? `Error in ${componentName}` : 'Application Error',
      description: error.message || 'An unexpected error has occurred.',
    };
  }

  render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, isDarkMode, componentName, showDetails, fallback, className } = this.props;

    if (hasError) {
      // Return custom fallback if provided
      if (fallback) {
        return fallback;
      }
      
      // Return default error UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          isDarkMode={isDarkMode}
          componentName={componentName}
          showDetails={showDetails}
          className={className}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundaryWithTheme;
