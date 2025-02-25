import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { usePlaid } from '../contexts/PlaidContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlaidLink } from 'react-plaid-link';
import { 
  HiOutlineRefresh, 
  HiOutlineCreditCard, 
  HiOutlinePlusCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineChartBar
} from 'react-icons/hi';

const LinkAccounts = () => {
  const { currentUser } = useAuth();
  const { createLinkToken, isPlaidConnected, loading: plaidLoading } = usePlaid();
  
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualAccount, setManualAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    institution: ''
  });

  // Initialize component and fetch data
  useEffect(() => {
    fetchAccounts();
    initializePlaid();
  }, []);

  // Initialize Plaid connection
  const initializePlaid = async () => {
    try {
      if (!linkToken) {
        const token = await createLinkToken();
        if (token) {
          setLinkToken(token);
        }
      }
    } catch (error) {
      console.error('Error initializing Plaid:', error);
      toast.error('Failed to initialize Plaid connection');
    }
  };

  // Configuration for Plaid Link
  const config = {
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      handlePlaidSuccess(public_token, metadata);
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link exit error:', err);
        toast.error(`Error connecting to bank: ${err.message || 'Unknown error'}`);
      }
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', eventName, metadata);
    }
  };

  const { open, ready } = usePlaidLink(config);

  // Handle successful Plaid connection
  const handlePlaidSuccess = async (publicToken, metadata) => {
    try {
      setLoading(true);
      const response = await api.post('/api/plaid/exchange-token', {
        public_token: publicToken,
        institution: metadata.institution,
        user_id: currentUser.uid
      });
      
      if (response.data) {
        toast.success('Account connected successfully!');
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error exchanging Plaid token:', error);
      toast.error('Failed to connect account');
    } finally {
      setLoading(false);
    }
  };

  // Fetch connected accounts
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

  // Refresh account data
  const refreshAccounts = async () => {
    try {
      setRefreshing(true);
      const response = await api.post('/api/plaid/refresh-accounts');
      if (response.data) {
        setAccounts(response.data);
        toast.success('Accounts refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      toast.error('Failed to refresh accounts');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle manual account input changes
  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualAccount({
      ...manualAccount,
      [name]: name === 'balance' ? parseFloat(value) || '' : value
    });
  };

  // Add manual account
  const handleAddManualAccount = async (e) => {
    e.preventDefault();
    
    if (!manualAccount.name || !manualAccount.type || manualAccount.balance === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post('/api/accounts/manual', manualAccount);
      
      if (response.data) {
        toast.success('Manual account added successfully');
        setAccounts([...accounts, response.data]);
        setManualAccount({
          name: '',
          type: 'checking',
          balance: '',
          institution: ''
        });
        setShowAddManual(false);
      }
    } catch (error) {
      console.error('Error adding manual account:', error);
      toast.error('Failed to add manual account');
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Icon mapping for account types
  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'depository':
      case 'checking':
      case 'savings':
        return '🏦';
      case 'credit':
        return '💳';
      case 'loan':
      case 'mortgage':
        return '💰';
      case 'investment':
        return '📈';
      default:
        return '🏦';
    }
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      // For credit accounts, balances are typically negative (what you owe)
      const balanceValue = account.type === 'credit' 
        ? -Math.abs(account.balance) 
        : account.balance;
      return total + balanceValue;
    }, 0);
  };

  // Render account cards
  const renderAccountCards = () => {
    if (loading && accounts.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (accounts.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <HiOutlineExclamationCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No accounts connected</h3>
          <p className="mt-2 text-sm text-gray-500">
            Connect your bank accounts to start tracking your finances.
          </p>
          <div className="mt-6">
            <button
              onClick={() => ready && open()}
              disabled={!ready || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HiOutlineCreditCard className="mr-2 h-5 w-5" />
              Connect Bank Account
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getAccountTypeIcon(account.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.institution}</p>
                </div>
              </div>
              <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(account.balance)}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Last updated: {new Date(account.last_updated || Date.now()).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-blue-500"
                  onClick={() => console.log('View transactions for', account.id)}
                >
                  <HiOutlineChartBar className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-400 hover:text-blue-500"
                  onClick={() => console.log('View details for', account.id)}
                >
                  <HiOutlineInformationCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render manual account form
  const renderManualAccountForm = () => {
    if (!showAddManual) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Manual Account</h3>
        <form onSubmit={handleAddManualAccount}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={manualAccount.name}
                onChange={handleManualInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., My Checking Account"
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">Institution (Optional)</label>
              <input
                type="text"
                name="institution"
                id="institution"
                value={manualAccount.institution}
                onChange={handleManualInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., My Bank"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                name="type"
                id="type"
                value={manualAccount.type}
                onChange={handleManualInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment</option>
                <option value="loan">Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Current Balance</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="balance"
                  id="balance"
                  value={manualAccount.balance}
                  onChange={handleManualInputChange}
                  className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddManual(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Connections</h1>
        <p className="mt-2 text-lg text-gray-600">
          Connect your financial accounts or add them manually to track your finances.
        </p>
      </header>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg shadow-lg text-white p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Financial Overview</h2>
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-white text-opacity-80">Total Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(calculateTotalBalance())}</p>
          </div>
          <div>
            <p className="text-white text-opacity-80">Connected Accounts</p>
            <p className="text-3xl font-bold">{accounts.length}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => ready && open()}
            disabled={!ready || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineCreditCard className="mr-2 h-5 w-5" />
            Connect Bank Account
          </button>
          
          <button
            onClick={() => setShowAddManual(!showAddManual)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HiOutlinePlusCircle className="mr-2 h-5 w-5" />
            Add Manual Account
          </button>
        </div>
        
        <button
          onClick={refreshAccounts}
          disabled={refreshing || loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineRefresh className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Accounts
        </button>
      </div>

      {/* Manual Account Form */}
      {renderManualAccountForm()}

      {/* Accounts Grid */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Accounts</h2>
        {renderAccountCards()}
      </div>
    </div>
  );
};

export default LinkAccounts; 