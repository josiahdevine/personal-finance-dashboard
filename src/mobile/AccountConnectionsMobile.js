import React, { useState, useEffect, useCallback } from 'react';
import { usePlaid } from '../contexts/PlaidContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlaidLink } from 'react-plaid-link';
import { toast } from 'react-toastify';
import apiService from '../services/liveApi';
import { log, logError } from '../utils/logger';
import { HiOutlineRefresh } from 'react-icons/hi';
import { 
  HiOutlineCreditCard, 
  HiOutlinePlusCircle,
  HiOutlineExclamationCircle,
  HiOutlineChevronRight,
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import LoadingSpinner from '../Components/ui/LoadingSpinner';

/**
 * Mobile-optimized version of Account Connections page
 */
const AccountConnectionsMobile = () => {
  const { currentUser } = useAuth();
  const { 
    createLinkToken, 
    exchangePublicToken,
    fetchPlaidAccounts,
    isPlaidConnected, 
    accounts: plaidAccounts,
    loading: plaidLoading 
  } = usePlaid();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualAccount, setManualAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    institution: '',
    notes: ''
  });
  const [error, setError] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(null);

  // Initialize Plaid connection
  const initializePlaid = useCallback(async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        log('AccountConnectionsMobile', 'User not authenticated, skipping initialization');
        return;
      }
      
      log('AccountConnectionsMobile', 'Initializing Plaid connection');
      const token = await createLinkToken();
      if (token) {
        setLinkToken(token);
        log('AccountConnectionsMobile', 'Link token retrieved successfully');
      }
    } catch (err) {
      logError('AccountConnectionsMobile', 'Error initializing Plaid:', err);
      setError('Failed to initialize Plaid connection. Please try again later.');
      toast.error('Failed to initialize Plaid connection');
    } finally {
      setLoading(false);
    }
  }, [currentUser, createLinkToken]);

  // Initialize component
  useEffect(() => {
    initializePlaid();
  }, [initializePlaid]);

  // Configuration for Plaid Link
  const config = {
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      handlePlaidSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      if (err) {
        logError('AccountConnectionsMobile', 'Plaid Link exit error:', err);
        toast.error(`Error connecting to bank: ${err.message || 'Unknown error'}`);
      }
    },
    onEvent: (eventName, metadata) => {
      log('AccountConnectionsMobile', 'Plaid Link event:', eventName, metadata);
    }
  };

  const { open, ready } = usePlaidLink(config);

  // Handle successful Plaid connection
  const handlePlaidSuccess = async (publicToken, metadata) => {
    try {
      setLoading(true);
      log('AccountConnectionsMobile', 'Exchanging public token', { institution: metadata.institution?.name });
      
      await exchangePublicToken(publicToken);
      toast.success('Account connected successfully!');
      
    } catch (err) {
      logError('AccountConnectionsMobile', 'Error connecting account:', err);
      toast.error('Failed to connect account');
    } finally {
      setLoading(false);
    }
  };

  // Refresh account data
  const refreshAccounts = async () => {
    try {
      setRefreshing(true);
      log('AccountConnectionsMobile', 'Refreshing accounts');
      
      await fetchPlaidAccounts();
      toast.success('Accounts refreshed successfully');
    } catch (err) {
      logError('AccountConnectionsMobile', 'Error refreshing accounts:', err);
      toast.error('Failed to refresh accounts');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle manual account input changes
  const handleManualInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setManualAccount({
      ...manualAccount,
      [name]: type === 'checkbox' ? checked : 
              name === 'balance' ? parseFloat(value) || '' : value
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
      log('AccountConnectionsMobile', 'Adding manual account', { name: manualAccount.name });
      
      const response = await apiService.addManualAccount(manualAccount);
      toast.success('Manual account added successfully');
      
      setManualAccount({
        name: '',
        type: 'checking',
        balance: '',
        institution: '',
        notes: ''
      });
      setShowAddManual(false);
      
      // Refresh accounts to include the new manual account
      await fetchPlaidAccounts();
    } catch (err) {
      logError('AccountConnectionsMobile', 'Error adding manual account:', err);
      toast.error('Failed to add manual account');
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount = 0, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    return plaidAccounts.reduce((total, account) => {
      // For credit accounts, balances are typically negative (what you owe)
      const balanceValue = account.account_type === 'credit' || account.account_subtype === 'credit card'
        ? -Math.abs(account.balance_current || 0) 
        : (account.balance_current || 0);
      return total + balanceValue;
    }, 0);
  };

  // Get account icon based on account type
  const getAccountIcon = (type, subtype) => {
    if (type === 'depository' && (subtype === 'checking' || subtype === 'savings')) {
      return <HiOutlineBanknotes className="h-5 w-5 text-blue-500" />;
    } else if (type === 'credit' || subtype === 'credit card') {
      return <HiOutlineCreditCard className="h-5 w-5 text-purple-500" />;
    } else if (type === 'investment') {
      return <HiOutlineArrowsRightLeft className="h-5 w-5 text-green-500" />;
    } else if (type === 'loan') {
      return <HiOutlineShieldCheck className="h-5 w-5 text-red-500" />;
    } else {
      return <HiOutlineBanknotes className="h-5 w-5 text-gray-500" />;
    }
  };

  // Toggle account details view
  const toggleAccountDetails = (accountId) => {
    setShowAccountDetails(showAccountDetails === accountId ? null : accountId);
  };

  // If loading initial data
  if (loading && !plaidAccounts.length && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 py-6">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Accounts</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-5">
          <div className="flex">
            <HiOutlineExclamationCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Summary Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg p-4 mb-5 text-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Financial Overview</h2>
          <button
            onClick={refreshAccounts}
            disabled={refreshing || loading}
            className="text-white opacity-80 hover:opacity-100 focus:outline-none disabled:opacity-50 p-1"
            aria-label="Refresh accounts"
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
            <p className="text-2xl font-bold">{plaidAccounts.length}</p>
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
          onClick={() => setShowAddManual(true)}
          className="flex-1 flex justify-center items-center py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg"
        >
          <HiOutlinePlusCircle className="mr-2 h-5 w-5" />
          Add Manual
        </button>
      </div>
      
      {/* Accounts List - Mobile Optimized */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Your Accounts {refreshing && <LoadingSpinner size="sm" className="ml-2 inline" />}
      </h2>
      
      {plaidAccounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <HiOutlineExclamationCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Accounts Connected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your financial accounts to see balances and transactions in one place.
          </p>
          <button
            onClick={() => ready && open()}
            disabled={!ready}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            Connect Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plaidAccounts.map((account) => (
            <div key={account.id || account.account_id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleAccountDetails(account.id || account.account_id)}
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-2 mr-3">
                    {getAccountIcon(account.account_type, account.account_subtype)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {account.account_name || account.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.institution_name || account.institution || 'Personal Account'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(account.balance_current || account.balance)}
                  </span>
                  <HiOutlineChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    showAccountDetails === (account.id || account.account_id) ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>
              
              {/* Account Details */}
              {showAccountDetails === (account.id || account.account_id) && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-800 dark:text-white capitalize">
                        {account.account_subtype || account.type || 'Account'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Account #</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {account.mask ? `•••• ${account.mask}` : 'Not available'}
                      </p>
                    </div>
                    {account.balance_available !== undefined && (
                      <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">Available Balance</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(account.balance_available)}
                        </p>
                      </div>
                    )}
                    {account.balance_limit !== undefined && account.balance_limit > 0 && (
                      <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">Credit Limit</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(account.balance_limit)}
                        </p>
                      </div>
                    )}
                    {account.notes && (
                      <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">Notes</p>
                        <p className="font-medium text-gray-800 dark:text-white">{account.notes}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {account.last_updated 
                          ? new Date(account.last_updated).toLocaleString() 
                          : account.updated_at 
                            ? new Date(account.updated_at).toLocaleString()
                            : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Manual Account Form */}
      {showAddManual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Manual Account</h2>
            <form onSubmit={handleAddManualAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                    Account Name*
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={manualAccount.name}
                    onChange={handleManualInputChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. My Checking Account"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="type">
                    Account Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={manualAccount.type}
                    onChange={handleManualInputChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit card">Credit Card</option>
                    <option value="investment">Investment</option>
                    <option value="loan">Loan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="balance">
                    Current Balance*
                  </label>
                  <input
                    id="balance"
                    name="balance"
                    type="number"
                    step="0.01"
                    value={manualAccount.balance}
                    onChange={handleManualInputChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For credit cards, enter a positive number (it will be displayed as negative)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="institution">
                    Institution (Optional)
                  </label>
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    value={manualAccount.institution}
                    onChange={handleManualInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Bank of America"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="notes">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={manualAccount.notes}
                    onChange={handleManualInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Additional information"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddManual(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountConnectionsMobile; 