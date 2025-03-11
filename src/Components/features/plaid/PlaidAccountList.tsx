import React from 'react';
// import { usePlaid } from '../../../contexts/PlaidContext';
import Card from "../../common/Card";
import { formatCurrency } from '../../../utils/formatters';
import { PlaidError } from './PlaidError';

// Define the PlaidAccount type
interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  balance: {
    current: number;
  };
  institutionName: string;
}

// Mock implementation of usePlaid
const usePlaid = () => {
  return {
    accounts: [] as PlaidAccount[],
    isLoading: false,
    error: null,
    refreshAccounts: () => {
      // This is a mock implementation
    }
  };
};

export const PlaidAccountList: React.FC = () => {
  const { accounts, isLoading, error, refreshAccounts } = usePlaid();

  if (error) {
    return <PlaidError error={error} onRetry={refreshAccounts} />;
  }

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-6">
            <p className="text-gray-500">No accounts connected yet.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium">{account.name}</h3>
                <p className="text-sm text-gray-500">{account.type}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(account.balance.current)}</p>
                <p className="text-sm text-gray-500">{account.institutionName}</p>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}; 