import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="error-boundary-fallback">
      <div className="error-boundary-container">
        <h2>Something went wrong</h2>
        <p className="error-message">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="error-actions">
          {resetErrorBoundary && (
            <button 
              className="btn btn-primary"
              onClick={resetErrorBoundary}
            >
              Try again
            </button>
          )}
          
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/'}
          >
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback; 