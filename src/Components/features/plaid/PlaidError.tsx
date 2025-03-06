import React from 'react';
import { Card } from '../../common/Card';

interface PlaidErrorProps {
  error: Error;
  onRetry?: () => void;
}

export const PlaidError: React.FC<PlaidErrorProps> = ({ error, onRetry }) => {
  return (
    <Card>
      <Card.Body>
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Connection Error
          </h3>
          <p className="text-sm text-gray-600">
            {error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 