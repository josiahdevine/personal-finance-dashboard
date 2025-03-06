import React from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { usePlaid } from '../../../contexts/PlaidContext';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { plaidService } from '../../../services/plaidService';

export const PlaidLink: React.FC = () => {
  const { refreshAccounts } = usePlaid();
  
  const { execute: createLinkToken, loading } = useAsyncAction(
    plaidService.createLinkToken,
    {
      onSuccess: (linkToken) => {
        open();
      }
    }
  );

  const { open, ready } = usePlaidLink({
    token: null,
    onSuccess: async (public_token, metadata) => {
      try {
        await plaidService.exchangePublicToken(public_token);
        await refreshAccounts();
      } catch (error) {
        console.error('Error linking account:', error);
      }
    },
  });

  return (
    <button
      onClick={() => createLinkToken()}
      disabled={loading || !ready}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Connecting...' : 'Connect a Bank Account'}
    </button>
  );
}; 