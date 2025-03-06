import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ApiError } from '../services/api';

interface ErrorMessage {
  title: string;
  description: string | ReactNode;
}

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | ApiError | null;
}

// Wrapper to use hooks in class component
const ErrorBoundaryWithTheme: React.FC<Props> = (props) => {
  const { isDarkMode } = useTheme() as ThemeContextValue;
  return <ErrorBoundaryClass {...props} isDarkMode={isDarkMode} />;
};

class ErrorBoundaryClass extends Component<Props & { isDarkMode: boolean }, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error | ApiError): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  private isApiError(error: unknown): error is ApiError {
    return error !== null && 
           typeof error === 'object' && 
           'isNetworkError' in error &&
           'status' in error &&
           'message' in error;
  }

  private getErrorMessage(): ErrorMessage {
    const { error } = this.state;

    if (!error) {
      return {
        title: 'Something went wrong',
        description: 'An unexpected error occurred',
      };
    }

    if (this.isApiError(error)) {
      if (error.isNetworkError) {
        return {
          title: 'Connection Error',
          description: (
            <>
              <p className="mb-2">We're having trouble connecting to our servers. This could be because:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The server is temporarily unavailable</li>
                <li>Your internet connection is unstable</li>
                {process.env.NODE_ENV === 'development' && (
                  <li>You're working in development mode and the local server isn't running on port 8888</li>
                )}
              </ul>
            </>
          ),
        };
      }

      return {
        title: `Error ${error.status}`,
        description: error.message,
      };
    }

    // Generic error handling
    const isNetworkError = 
      error instanceof Error &&
      (error.message.includes('Network Error') ||
       error.message.includes('Failed to fetch') ||
       error.message.includes('ERR_CONNECTION_REFUSED'));

    if (isNetworkError) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
      };
    }

    return {
      title: 'Something went wrong',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }

  public render(): ReactNode {
    const { isDarkMode } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description } = this.getErrorMessage();
      const error = this.state.error;

      return (
        <div className={`p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8 ${
          isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}>
          <h2 className="text-2xl font-semibold mb-4">
            {title}
          </h2>
          <div className="mb-6">
            {typeof description === 'string' ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            {(this.isApiError(error) && error.isNetworkError) && (
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className={`px-4 py-2 rounded-md border ${
                  isDarkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Continue Without Connection
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ErrorBoundaryWithTheme;
