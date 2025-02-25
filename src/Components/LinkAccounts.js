import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const LinkAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/plaid/accounts');
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    try {
      // This would open Plaid Link when integrated
      toast.info('Plaid Link feature would open here in the live app');
      // After successful linking, refresh the accounts list
      fetchAccounts();
    } catch (error) {
      console.error('Error linking account:', error);
      toast.error('Failed to link account');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'depository':
        return '🏦';
      case 'credit':
        return '💳';
      case 'loan':
        return '💰';
      case 'investment':
        return '📈';
      default:
        return '🏦';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Link Your Accounts</h2>
        <button
          onClick={handleLinkAccount}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
        >
          Link New Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{getAccountTypeIcon(account.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold">{account.name}</h3>
                  <p className="text-sm text-gray-600">{account.official_name || account.subtype}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance</span>
                <span className="font-bold">
                  {formatCurrency(account.balances?.current || 0, account.balances?.iso_currency_code || 'USD')}
                </span>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date(account.updated_at || Date.now()).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Accounts Linked</h3>
          <p className="text-gray-600 mb-6">
            Connect your financial accounts to track your net worth and transactions.
          </p>
          <button
            onClick={handleLinkAccount}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
          >
            Link Your First Account
          </button>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About Account Linking</h3>
        <p className="text-gray-700 mb-4">
          We use Plaid to securely connect to your financial institutions. Your credentials are never
          stored on our servers, and all data is encrypted.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Supported Account Types</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>Checking & Savings</li>
              <li>Credit Cards</li>
              <li>Loans</li>
              <li>Investments</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Security Information</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>Bank-level 256-bit encryption</li>
              <li>Credentials never stored</li>
              <li>Read-only access</li>
              <li>Disconnect anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAccounts; 