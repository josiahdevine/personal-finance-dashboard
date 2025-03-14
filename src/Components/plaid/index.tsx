import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlaidLink } from '../features/plaid/PlaidLink';

/**
 * @deprecated This component is deprecated. Please use the main PlaidLink component from 
 * 'src/components/features/plaid/PlaidLink.tsx' for new implementations.
 * If you need the full dashboard UI, refer to 'src/pages/Dashboard/AccountConnections.tsx'.
 * For the consolidated PlaidIntegration, use 'src/components/plaid-integration/index.tsx'.
 * This file will be removed in a future update as part of the component consolidation initiative.
 */

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number;
    limit?: number;
  };
  institution: string;
  status: 'active' | 'disconnected' | 'error';
  lastSync?: string;
}

/**
 * @deprecated Please use the main PlaidLink component for bank connections.
 * This component will be removed in a future update.
 */
const PlaidIntegration: React.FC = () => {
  const [accounts, _setAccounts] = useState<PlaidAccount[]>([
    {
      id: '1',
      name: 'Main Checking',
      type: 'depository',
      subtype: 'checking',
      mask: '1234',
      balances: {
        available: 2543.55,
        current: 2543.55,
      },
      institution: 'Chase',
      status: 'active',
      lastSync: '2024-03-05T12:00:00Z',
    },
    {
      id: '2',
      name: 'Savings Account',
      type: 'depository',
      subtype: 'savings',
      mask: '5678',
      balances: {
        available: 10000.00,
        current: 10000.00,
      },
      institution: 'Chase',
      status: 'active',
      lastSync: '2024-03-05T12:00:00Z',
    },
    {
      id: '3',
      name: 'Credit Card',
      type: 'credit',
      subtype: 'credit card',
      mask: '9012',
      balances: {
        available: 4500,
        current: 500,
        limit: 5000,
      },
      institution: 'Chase',
      status: 'active',
      lastSync: '2024-03-05T12:00:00Z',
    },
  ]);

  useEffect(() => {
    console.warn(
      'Warning: You are using a deprecated PlaidIntegration component. ' +
      'Please use the main PlaidLink component from src/components/features/plaid/PlaidLink.tsx for connecting accounts ' +
      'or the consolidated PlaidIntegration component from src/components/plaid-integration/index.tsx.'
    );
  }, []);

  const handlePlaidSuccess = useCallback(() => {
    console.log('Successfully connected a new account');
  }, []);

  const getStatusColor = (status: PlaidAccount['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
          <PlaidLink
            onSuccess={handlePlaidSuccess}
            buttonText="Connect Account"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <motion.div
              key={account.id}
              className="bg-white rounded-lg shadow p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.institution}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Available Balance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${account.balances.available?.toLocaleString() ?? '0.00'}
                  </div>
                </div>

                {account.balances.limit && (
                  <div>
                    <div className="text-sm text-gray-600">Credit Limit</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${account.balances.limit.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900">
                      {account.type} ({account.subtype})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Last Synced</span>
                    <span className="font-medium text-gray-900">
                      {new Date(account.lastSync || '').toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                    onClick={() => console.log('Sync account:', account.id)}
                  >
                    Sync Now
                  </button>
                  <button
                    className="text-sm text-red-600 hover:text-red-800"
                    onClick={() => console.log('Disconnect account:', account.id)}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {accounts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts connected</h3>
            <p className="text-gray-500 mb-4">Connect your bank accounts to get started</p>
            <PlaidLink
              onSuccess={handlePlaidSuccess}
              buttonText="Connect Your First Account"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PlaidIntegration; 