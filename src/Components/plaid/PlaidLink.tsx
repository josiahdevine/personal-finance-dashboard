import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

interface PlaidLinkProps {
  onSuccess: () => void;
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createLinkToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const { link_token } = await response.json();
      setLinkToken(link_token);
    } catch (err) {
      setError('Error connecting to Plaid');
      console.error('Error creating link token:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    createLinkToken();
  }, [createLinkToken]);

  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          public_token: publicToken,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange public token');
      }

      onSuccess();
    } catch (err) {
      setError('Error connecting your bank account');
      console.error('Error exchanging public token:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: onPlaidSuccess,
    onExit: () => {
      // Handle the case when a user exits the Plaid Link flow
      setError(null);
    },
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-800 p-4 rounded-md"
        >
          {error}
        </motion.div>
      )}

      <button
        onClick={() => open()}
        disabled={!ready || isLoading}
        className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
          !ready || isLoading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting to Plaid...
          </span>
        ) : (
          'Connect Your Bank'
        )}
      </button>
    </div>
  );
}; 