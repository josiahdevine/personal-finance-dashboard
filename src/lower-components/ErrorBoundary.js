// Direct implementation of ErrorBoundary component
// This ensures it works directly without relying on any other files
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            An error occurred in this application. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
              <summary className="font-medium cursor-pointer text-red-500">Error Details (Development Only)</summary>
              <pre className="mt-2 text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre className="mt-2 text-sm text-gray-600 dark:text-gray-400 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 