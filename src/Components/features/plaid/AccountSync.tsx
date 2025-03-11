import React from 'react';
import { useAccounts } from '../../../hooks/useAccounts';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import Card from "../../common/card_component/Card";

// Use a specific interface for the account data we need
interface AccountWithSync {
  id: string;
  name: string;
  institution?: string;
  lastSync?: string;
}

export const AccountSync: React.FC = () => {
  const { accounts, refreshAccounts, isLoading: isLoadingAccounts, error } = useAccounts();

  const { execute: syncAccounts, isLoading: isSyncing } = useAsyncAction(refreshAccounts, {
    onSuccess: () => {
      // Show success toast or notification
    }
  });

  const lastSync = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return new Date(0);
    
    // Use a proper reduce function with correct typings
    return (accounts as AccountWithSync[]).reduce((latest, account) => {
      if (!account.lastSync) return latest;
      const accountSync = new Date(account.lastSync);
      return accountSync > latest ? accountSync : latest;
    }, new Date(0));
  }, [accounts]);

  const isLoading = isLoadingAccounts || isSyncing;

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Account Synchronization</h2>
          <button
            onClick={() => syncAccounts()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </Card.Header>
      <Card.Body>
        {error ? (
          <div className="p-4 text-red-600">
            Error loading accounts: {error instanceof Error ? error.message : String(error)}
          </div>
        ) : isLoadingAccounts ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading accounts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Last synchronized: {lastSync instanceof Date && lastSync.getTime() > 0 ? lastSync.toLocaleString() : 'Never'}
            </div>
            {accounts && accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 border rounded-lg"
                  >
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-600">
                      Institution: {(account as AccountWithSync).institution || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last sync: {(account as AccountWithSync).lastSync ? new Date((account as AccountWithSync).lastSync!).toLocaleString() : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-600">
                No accounts found. Connect an account to get started.
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 