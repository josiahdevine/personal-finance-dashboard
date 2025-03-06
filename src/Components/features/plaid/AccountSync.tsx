import React from 'react';
import { usePlaid } from '../../../contexts/PlaidContext';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { Card } from '../../common/Card';

export const AccountSync: React.FC = () => {
  const { accounts, refreshAccounts } = usePlaid();

  const { execute: syncAccounts, loading } = useAsyncAction(refreshAccounts, {
    onSuccess: () => {
      // Show success toast or notification
    }
  });

  const lastSync = React.useMemo(() => {
    return accounts.reduce((latest, account) => {
      const accountSync = new Date(account.last_sync || 0);
      return accountSync > latest ? accountSync : latest;
    }, new Date(0));
  }, [accounts]);

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Account Synchronization</h2>
          <button
            onClick={() => syncAccounts()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Last synchronized: {lastSync.toLocaleString()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(account => (
              <div
                key={account.id}
                className="p-4 border rounded-lg"
              >
                <h3 className="font-medium">{account.name}</h3>
                <p className="text-sm text-gray-600">
                  Institution: {account.institution_name}
                </p>
                <p className="text-sm text-gray-600">
                  Last sync: {new Date(account.last_sync || '').toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 