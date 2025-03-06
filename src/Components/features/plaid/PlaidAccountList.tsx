import React from 'react';
import { usePlaid } from '../../../contexts/PlaidContext';
import { Card } from '../../common/Card';
import { formatCurrency } from '../../../utils/formatters';
import { PlaidError } from './PlaidError';

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

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Connected Accounts</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          {accounts.map(account => (
            <div
              key={account.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-gray-600">
                    {account.official_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {account.institution_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCurrency(account.balance.current)}
                  </p>
                  {account.balance.available !== null && (
                    <p className="text-sm text-gray-600">
                      Available: {formatCurrency(account.balance.available)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <p className="text-center text-gray-600">
              No accounts connected yet
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 