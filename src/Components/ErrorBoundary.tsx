import React, { Component } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ApiError } from '../services/api';

interface ErrorMessage {
  title: string;
  description: string | React.ReactNode;
}

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface Props {
  children: React.ReactNode;
  componentName?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const ErrorFallback: React.FC<{
  error: Error;
  errorInfo: React.ErrorInfo | null;
  isDarkMode: boolean;
  componentName?: string;
  showDetails?: boolean;
}> = ({ error, errorInfo, isDarkMode, componentName, showDetails }) => (
  <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg`}>
    <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong {componentName ? `in ${componentName}` : ''}</h2>
    <p className="mb-4">{error.message}</p>
    {showDetails && errorInfo && (
      <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <summary className="cursor-pointer">Stack trace</summary>
        <pre className="mt-2 overflow-auto text-sm p-2">{errorInfo.componentStack}</pre>
      </details>
    )}
    <div className="mt-4">
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Function to safely get theme outside of hooks with more detailed logging
function safelyGetTheme(): boolean {
  try {
    // First try to get theme from document class
    const hasDarkClass = document.documentElement.classList.contains('dark');
    if (hasDarkClass) {
      return true;
    }
    
    // Then try to get from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      return true;
    }
    
    // Finally check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.warn('Failed to detect theme from DOM or localStorage, defaulting to light mode');
    return false;
  }
}

const ErrorBoundaryWithTheme: React.FC<Props> = (props) => {
  let isDarkMode = false;
  
  try {
    // Always call hook unconditionally to avoid React Hook errors
    // But wrap it in a try-catch to handle case when context is missing
    const themeContext = useTheme() as ThemeContextValue;
    isDarkMode = themeContext.isDarkMode;
  } catch (e) {
    // If theme context is not available, try to get it from DOM/localStorage
    isDarkMode = safelyGetTheme();
    console.warn('ThemeProvider not found, using DOM to detect theme', e);
  }
  
  return <ErrorBoundaryClass {...props} isDarkMode={isDarkMode} />;
};

class ErrorBoundaryClass extends Component<Props & { isDarkMode: boolean }, State> {
  constructor(props: Props & { isDarkMode: boolean }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
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

  public render(): React.ReactNode {
    const { isDarkMode, componentName, showDetails } = this.props;

    if (this.state.hasError) {
      const error = this.state.error || new Error('Unknown error');
      const errorInfo = this.state.errorInfo;

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          isDarkMode={isDarkMode}
          componentName={componentName}
          showDetails={showDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithTheme;
