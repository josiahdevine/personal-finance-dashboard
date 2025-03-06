import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

interface UsePlaidLinkOptions {
  onSuccess?: PlaidLinkOnSuccess;
  onExit?: () => void;
}

export function usePlaidLink({ onSuccess, onExit }: UsePlaidLinkOptions = {}) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const generateToken = useCallback(async () => {
    if (!user) {
      setError(new Error('User must be authenticated'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Plaid Link token');
      }

      const data = await response.json();
      setToken(data.link_token);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const config: PlaidLinkOptions = {
    token,
    onSuccess: async (public_token, metadata) => {
      if (!user) {
        setError(new Error('User must be authenticated'));
        return;
      }

      try {
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_token,
            metadata,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        if (onSuccess) {
          onSuccess(public_token, metadata);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to exchange token'));
      }
    },
    onExit: () => {
      setToken(null);
      if (onExit) {
        onExit();
      }
    },
  };

  return {
    ready: !!token && !isLoading,
    error,
    generateToken,
    config,
  };
}

export default usePlaidLink; 