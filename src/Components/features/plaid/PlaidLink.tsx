import React from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import PlaidService from '../../../services/PlaidService';

export const PlaidLink: React.FC = () => {
  const { user } = useAuth();

  // Always call hooks unconditionally
  const { open, ready } = usePlaidLink({
    token: null,
    onSuccess: async (public_token, _metadata) => {
      if (!user) return; // safeguard if no user
      try {
        await PlaidService.exchangePublicToken(public_token, user.id);
      } catch (error) {
        console.error('Error linking account:', error);
      }
    },
  });

  const { execute, isLoading } = useAsyncAction(PlaidService.createLinkToken);

  const handleCreateLinkToken = async () => {
    if (!user) return; // safeguard if no user
    try {
      await execute(user.id);
      open();
    } catch (error) {
      console.error('Error creating link token:', error);
    }
  };

  // Conditional rendering fallback after hooks are called
  if (!user) {
    return <div>Please log in to link your bank account.</div>;
  }

  return (
    <button
      onClick={handleCreateLinkToken}
      disabled={isLoading || !ready}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Connecting...' : 'Connect a Bank Account'}
    </button>
  );
};