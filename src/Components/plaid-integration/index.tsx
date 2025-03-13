import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { PlaidLink } from '../features/plaid/PlaidLink';

/**
 * @deprecated This component is being consolidated. Please use the main PlaidLink component 
 * from 'src/components/features/plaid/PlaidLink.tsx' for new implementations.
 * If you need the full dashboard UI, refer to 'src/pages/Dashboard/AccountConnections.tsx'.
 * This file will be removed in a future update as part of the component consolidation initiative.
 */

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  institution: string;
  status: 'active' | 'disconnected' | 'error';
  lastSync: string;
  balance: {
    available: number;
    current: number;
    limit?: number;
  };
}

interface PlaidError {
  accountId: string;
  error: string;
  timestamp: string;
}

/**
 * @deprecated Please use the main PlaidLink component for bank connections.
 * This component will be removed in a future update.
 */
const PlaidIntegration: React.FC = () => {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<PlaidError[]>([]);

  useEffect(() => {
    console.warn(
      'Warning: You are using a deprecated PlaidIntegration component. ' +
      'Please use the main PlaidLink component from src/components/features/plaid/PlaidLink.tsx for connecting accounts.'
    );
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Mock data for demo purposes
      setTimeout(() => {
        setAccounts([
          {
            id: '1',
            name: 'Main Checking',
            type: 'depository',
            subtype: 'checking',
            mask: '1234',
            institution: 'Chase',
            status: 'active',
            lastSync: new Date().toISOString(),
            balance: {
              available: 2543.55,
              current: 2543.55,
            }
          },
          {
            id: '2',
            name: 'Savings Account',
            type: 'depository',
            subtype: 'savings',
            mask: '5678',
            institution: 'Chase',
            status: 'active',
            lastSync: new Date().toISOString(),
            balance: {
              available: 10000.00,
              current: 10000.00,
            }
          },
          {
            id: '3',
            name: 'Credit Card',
            type: 'credit',
            subtype: 'credit card',
            mask: '9012',
            institution: 'Chase',
            status: 'disconnected',
            lastSync: new Date().toISOString(),
            balance: {
              available: 4500,
              current: 500,
            }
          }
        ]);
        setSyncErrors([
          {
            accountId: '3',
            error: 'Connection interrupted. Please reconnect your account.',
            timestamp: new Date().toISOString()
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handlePlaidSuccess = useCallback(() => {
    console.log('Successfully connected a new account');
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance.current, 0);
  const activeAccounts = accounts.filter(account => account.status === 'active');
  const disconnectedAccounts = accounts.filter(account => account.status === 'disconnected');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
        <PlaidLink
          onSuccess={handlePlaidSuccess}
          buttonText="Connect New Account"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Total Balance</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 mt-2">Across all accounts</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Active Accounts</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-green-600">
              {activeAccounts.length}
            </div>
            <p className="text-gray-500 mt-2">
              of {accounts.length} total accounts
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Sync Status</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-yellow-600">
              {disconnectedAccounts.length}
            </div>
            <p className="text-gray-500 mt-2">
              accounts need attention
            </p>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
        </Card.Header>
        <Card.Body>
          <div className="divide-y divide-gray-200">
            {accounts.map(account => {
              const error = syncErrors.find(e => e.accountId === account.id);
              
              return (
                <div key={account.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {account.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.status === 'active' ? 'bg-green-100 text-green-800' :
                        account.status === 'disconnected' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {account.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {account.institution} •••• {account.mask}
                    </p>
                    {error && (
                      <p className="text-xs text-red-600 mt-1">
                        {error.error}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${account.balance.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(account.lastSync).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <p className="py-4 text-gray-500 text-center">No accounts connected</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PlaidIntegration; 