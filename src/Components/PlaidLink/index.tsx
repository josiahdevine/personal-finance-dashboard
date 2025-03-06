import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PlaidService } from '../../services/PlaidService';
import { useAuth } from '../../hooks/useAuth';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
  onSuccess,
  className = '',
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const plaidService = new PlaidService();

  const onSuccessCallback = useCallback(
    async (publicToken: string) => {
      try {
        setLoading(true);
        setError(null);
        await plaidService.exchangePublicToken(publicToken);
        onSuccess?.();
      } catch (err) {
        console.error('Error linking account:', err);
        setError('Failed to link account. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [plaidService, onSuccess]
  );

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
    onExit: () => {
      setLinkToken(null);
      setError(null);
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    const getToken = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const token = await plaidService.createLinkToken(user.id);
        setLinkToken(token);
      } catch (err) {
        console.error('Error getting link token:', err);
        setError('Failed to initialize Plaid. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getToken();
  }, [user, plaidService]);

  if (error) {
    return (
      <div className="text-red-600 text-sm mt-2">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading || !linkToken}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Connecting...' : 'Link Bank Account'}
    </button>
  );
}; 