import React from 'react';
import { logError } from '../utils/logger';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
    
    // Log that the ErrorBoundary was created
    
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    logError('ErrorBoundary', `Error caught in ${this.props.componentName || 'Unknown component'}`, error, {
      componentStack: errorInfo?.componentStack,
      props: this.props.logProps ? JSON.stringify(this.props.children?.props) : '[Props logging disabled]'
    });
    
    // Store error info for rendering
    this.setState({ errorInfo });
    
    // Show a toast notification for user feedback
    if (this.props.showToast !== false) {
      toast.error(`An error occurred in ${this.props.componentName || 'the application'}. Please try again or refresh the page.`);
    }
    
    // Call any onError callback provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        
      }
    }
  }

  resetError = () => {
    
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    // If there was an error, render the fallback UI
    if (this.state.hasError) {
      // Check if a custom fallback was provided
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.state.errorInfo, this.resetError)
          : this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 m-2 border border-red-300 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">
            Something went wrong in {this.props.componentName || 'this component'}
          </h2>
          <div className="mt-2">
            <p className="text-red-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.props.showDetails && (
              <details className="mt-2 border border-red-200 p-2 rounded bg-white">
                <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
                {this.state.errorInfo && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Component Stack:</h4>
                    <pre className="mt-1 text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </details>
            )}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={this.resetError} onKeyDown={this.resetError} role="button" tabIndex={0}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()} onKeyDown={() => window.location.reload()} role="button" tabIndex={0}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

export default ErrorBoundary; 