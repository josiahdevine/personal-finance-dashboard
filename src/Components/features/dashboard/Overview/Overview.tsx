import React from 'react';
import type { AggregatedAccount } from '../../../../services/AccountAggregationService';

interface OverviewProps {
  accounts: AggregatedAccount[];
  onRefresh: () => void;
  onAccountClick: (account: AggregatedAccount) => void;
}

const Overview: React.FC<OverviewProps> = ({ accounts, onRefresh, onAccountClick }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Accounts Summary</h2>
        
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No accounts found. Add your first account to get started.</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Add Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div 
                key={account.id} 
                onClick={() => onAccountClick(account)}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
                  </div>
                  <span className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: account.currency 
                    }).format(account.balance.current)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {account.lastUpdated ? new Date(account.lastUpdated).toLocaleDateString() : 'Not available'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <p className="text-gray-500 dark:text-gray-400">No transactions to display.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
          <div className="h-60 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
