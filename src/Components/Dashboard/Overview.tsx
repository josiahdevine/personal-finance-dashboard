import React from 'react';
import { AggregatedAccount } from '../../services/AccountAggregationService';
import { PlaidLinkButton } from '../PlaidLink';
import { NetWorthApplet } from '../NetWorthApplet';

interface OverviewProps {
  accounts: AggregatedAccount[];
  onAccountClick: (account: AggregatedAccount) => void;
  onRefresh: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ accounts, onAccountClick, onRefresh }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Overview</h1>
        <div className="flex space-x-4">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
          <PlaidLinkButton onSuccess={onRefresh} />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Net Worth Applet - Full Width on Small Screens */}
        <div className="lg:col-span-2 xl:col-span-3">
          <NetWorthApplet />
        </div>

        {/* Connected Accounts */}
        <div className="lg:col-span-2 xl:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => onAccountClick(account)}
                  className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.type}</p>
                      {account.institution && (
                        <p className="text-xs text-gray-500">{account.institution}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
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
        </div>
      </div>
    </div>
  );
};
