import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { 
  PlaidLinkOptions,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkError,
  PlaidLinkOnEventMetadata,
  usePlaidLink as usePlaidLinkSDK
} from 'react-plaid-link';

interface UsePlaidLinkOptions {
  onSuccess?: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  onExit?: (error: PlaidLinkError | null, metadata: PlaidLinkOnEventMetadata) => void;
  onEvent?: (eventName: string, metadata: PlaidLinkOnEventMetadata) => void;
}

export function usePlaidLink({ onSuccess, onExit, onEvent }: UsePlaidLinkOptions = {}) {
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

  // Only create the config object when token is available
  const config: PlaidLinkOptions | undefined = token ? {
    token,
    onSuccess: async (public_token, metadata) => {
      if (!user) {
        setError(new Error('User must be authenticated'));
        return;
      }

      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        setError(new Error(err.display_message || err.error_message));
      }
      setToken(null);
      if (onExit) {
        onExit(err, metadata);
      }
    },
    onEvent: onEvent,
  } : undefined;

  // Use the Plaid SDK's hook with our config, only when config is defined
  const { open, ready, error: plaidError } = usePlaidLinkSDK(config as PlaidLinkOptions);

  return {
    ready: !!token && ready && !isLoading,
    error: error || plaidError,
    generateToken,
    open,
    isLoading,
  };
}

export default usePlaidLink; 