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
 */

interface ErrorMessage {
  title: string;
  description: string | React.ReactNode;
}

interface Props {
  children: ReactNode;
  componentName?: string;
  showDetails?: boolean;
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
  showDetails = process.env.NODE_ENV === 'development' 
}: { 
  error: Error | null; 
  errorInfo: ErrorInfo | null; 
  isDarkMode: boolean;
  componentName?: string;
  showDetails?: boolean;
}) => {
  const isApiError = error instanceof ApiError;
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
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
            onClick={() => window.location.href = '/'}
            className={`px-4 py-2 rounded ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper to provide theme context to the class component
const ErrorBoundaryWithTheme: React.FC<Props> = (props) => {
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
    // Log error information
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // You could also log to an error monitoring service here
    // logErrorToService(error, errorInfo);
  }

  isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  getErrorMessage(): ErrorMessage {
    const { error } = this.state;
    
    if (!error) {
      return {
        title: 'Unknown Error',
        description: 'An unknown error occurred.',
      };
    }

    if (this.isApiError(error)) {
      return {
        title: 'API Error',
        description: `${error.message} (Code: ${error.statusCode})`,
      };
    }

    return {
      title: 'Application Error',
      description: error.message,
    };
  }

  render(): React.ReactNode {
    const { children, componentName, showDetails } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          isDarkMode={this.props.isDarkMode}
          componentName={componentName}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundaryWithTheme;
