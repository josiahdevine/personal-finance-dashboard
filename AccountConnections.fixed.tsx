import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { PlaidLink } from '../../components/features/plaid/PlaidLink';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AccountConnections: React.FC = () => {
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch connected accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      return response.json();
    },
  });

  // Fetch institutions for display
  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const response = await fetch('/api/institutions');
      if (!response.ok) {
        throw new Error('Failed to fetch institutions');
      }
      return response.json();
    },
  });

  // Mutation to disconnect an account
  const { mutate: disconnectAccount } = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  // This function is called when a bank account is successfully connected via Plaid
  // We need to remove the metadata parameter to match the PlaidLink component's onSuccess prop type
  const handlePlaidSuccess = () => {
    console.log('Successfully connected account');
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    setIsPlaidModalOpen(false);
  };

  const getInstitutionName = (institutionId: string) => {
    const institution = institutions.find(i => i.id === institutionId);
    return institution?.name || 'Unknown Institution';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Connected Accounts</h2>
        <Button onClick={() => setIsPlaidModalOpen(true)}>Connect New Account</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No accounts connected yet</p>
            <Button onClick={() => setIsPlaidModalOpen(true)}>Connect Your First Account</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    <p className="text-sm text-gray-500">{getInstitutionName(account.institutionId)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectAccount(account.id)}
                  >
                    Disconnect
                  </Button>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                  <p className="text-xs text-gray-500">
                    Last updated: {formatDate(account.lastUpdated)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isPlaidModalOpen}
        onClose={() => setIsPlaidModalOpen(false)}
        title="Connect Your Bank Account"
      >
        <div className="mt-4">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bank Account</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect your bank account to track your transactions and balances.
              </p>
              <PlaidLink
                onSuccess={handlePlaidSuccess}
                buttonText="Connect Bank Account"
                variant="primary"
                size="md"
                isFullWidth
              />
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
}; 