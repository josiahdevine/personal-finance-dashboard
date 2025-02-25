import React, { useState, useEffect } from 'react';
import { usePlaid } from '../contexts/PlaidContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlaidLink } from 'react-plaid-link';
import { toast } from 'react-toastify';
import api from '../services/api';
import { 
  HiOutlineRefresh, 
  HiOutlineCreditCard, 
  HiOutlinePlusCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineChevronRight
} from 'react-icons/hi';

/**
 * Mobile-optimized version of Account Connections page
 */
const AccountConnectionsMobile = () => {
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

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Accounts</h1>
      
      {/* Summary Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg shadow p-4 mb-5 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Overview</h2>
          <button
            onClick={refreshAccounts}
            disabled={refreshing || loading}
            className="text-white opacity-80 hover:opacity-100 focus:outline-none disabled:opacity-50"
          >
            <HiOutlineRefresh className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-white text-opacity-80 text-sm">Total Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(calculateTotalBalance())}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-opacity-80 text-sm">Accounts</p>
            <p className="text-2xl font-bold">{accounts.length}</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Mobile Optimized */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => ready && open()}
          disabled={!ready || loading}
          className="flex-1 flex justify-center items-center py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineCreditCard className="mr-2 h-5 w-5" />
          Connect Bank
        </button>
        
        <button
          onClick={() => setShowAddManual(!showAddManual)}
          className="flex-1 flex justify-center items-center py-3 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg"
        >
          <HiOutlinePlusCircle className="mr-2 h-5 w-5" />
          Add Manual
        </button>
      </div>
      
      {/* Manual Account Form - Mobile Optimized */}
      {showAddManual && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Add Manual Account</h2>
          <form onSubmit={handleAddManualAccount}>
            <div className="space-y-4">
              <div>
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
              
              <div>
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
              
              <div>
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
              
              <div>
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
            
            <div className="mt-5 flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddManual(false)}
                className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Add Account
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Accounts List - Mobile Optimized */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Accounts</h2>
      
      {loading && accounts.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-lg p-5 text-center shadow-sm border border-gray-200">
          <HiOutlineExclamationCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-medium text-gray-900">No accounts connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your bank accounts to start tracking your finances.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getAccountTypeIcon(account.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <p className="text-xs text-gray-500">{account.institution}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'} mr-2`}>
                    {formatCurrency(account.balance)}
                  </span>
                  <HiOutlineChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountConnectionsMobile; 