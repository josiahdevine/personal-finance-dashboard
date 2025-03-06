import React from 'react';
import { AggregatedAccount } from '../../services/AccountAggregationService';

interface MobileOverviewProps {
  accounts: AggregatedAccount[];
  onAccountClick: (account: AggregatedAccount) => void;
  onRefresh: () => void;
}

export const MobileOverview: React.FC<MobileOverviewProps> = ({ accounts, onAccountClick, onRefresh }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Accounts Overview</h1>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => onAccountClick(account)}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{account.name}</h3>
                <p className="text-sm text-gray-600">{account.type}</p>
                {account.institution && (
                  <p className="text-xs text-gray-500">{account.institution}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {account.balance.current.toLocaleString('en-US', {
                    style: 'currency',
                    currency: account.currency
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 