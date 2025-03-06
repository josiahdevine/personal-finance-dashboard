import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Card } from '../../components/common/Card';

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

const PlaidIntegration: React.FC = () => {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<PlaidError[]>([]);

  const fetchAccounts = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/plaid/accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSyncErrors = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/plaid/sync-errors');
        const data = await response.json();
        setSyncErrors(data);
      } catch (err) {
        console.error('Error fetching sync errors:', err);
      }
    };

    fetchSyncErrors();
  }, []);

  useEffect(() => {
    const initializePlaid = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/plaid/create-link-token');
        const { link_token } = await response.json();
        setLinkToken(link_token);
      } catch (err) {
        setError('Failed to initialize Plaid');
        console.error('Error initializing Plaid:', err);
      }
    };

    initializePlaid();
    fetchAccounts();
  }, []);

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      fetchAccounts();
    } catch (err) {
      setError('Failed to link account');
      console.error('Error linking account:', err);
    }
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
        <button
          onClick={() => open()}
          disabled={!ready}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Connect New Account
        </button>
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
    </div>
  );
};

export default PlaidIntegration; 