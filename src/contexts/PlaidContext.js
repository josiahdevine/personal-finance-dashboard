import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/liveApi';
import { log, logError } from '../utils/logger';
import { toast } from 'react-toastify';

// Maximum retry attempts for API calls
const MAX_RETRIES = 3;

// Retry helper function for API calls
const retryApiCall = async (apiCall, maxRetries = MAX_RETRIES) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        log('PlaidContext', `Retry attempt ${attempt + 1}/${maxRetries}`);
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      log('PlaidContext', `API call failed, attempt ${attempt + 1}/${maxRetries}`, error);
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

const PlaidContext = createContext();

export function usePlaid() {
  const context = useContext(PlaidContext);
  if (!context) {
    logError('usePlaid', 'PlaidContext used outside of provider', 
      new Error('usePlaid must be used within a PlaidProvider'));
  }
  return context;
}

export function PlaidProvider({ children }) {
  const { currentUser } = useAuth();
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isPlaidConnected, setIsPlaidConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextReady, setContextReady] = useState(false);
  const [plaidConfig, setPlaidConfig] = useState(null);
  
  // Fetch Plaid accounts
  const fetchPlaidAccounts = useCallback(async () => {
    if (!currentUser) {
      logError('PlaidContext', 'Cannot fetch accounts: No authenticated user');
      return [];
    }
    
    setLoading(true);
    
    try {
      log('PlaidContext', 'Fetching Plaid accounts');
      
      const response = await retryApiCall(() => apiService.getPlaidAccounts());
      
      if (response && Array.isArray(response)) {
        log('PlaidContext', `Retrieved ${response.length} Plaid accounts`);
        setAccounts(response);
        setLoading(false);
        return response;
      } else {
        throw new Error('Invalid accounts response format');
      }
    } catch (err) {
      logError('PlaidContext', 'Error fetching Plaid accounts:', err);
      setError('Failed to retrieve your financial accounts');
      setLoading(false);
      return [];
    }
  }, [currentUser]);
  
  // Fetch Plaid transactions
  const fetchPlaidTransactions = useCallback(async (options = {}) => {
    if (!currentUser) {
      logError('PlaidContext', 'Cannot fetch transactions: No authenticated user');
      return [];
    }
    
    setLoading(true);
    
    try {
      log('PlaidContext', 'Fetching Plaid transactions', options);
      
      const response = await retryApiCall(() => 
        apiService.getPlaidTransactions(options)
      );
      
      if (response && Array.isArray(response)) {
        log('PlaidContext', `Retrieved ${response.length} Plaid transactions`);
        setTransactions(response);
        setLoading(false);
        return response;
      } else {
        throw new Error('Invalid transactions response format');
      }
    } catch (err) {
      logError('PlaidContext', 'Error fetching Plaid transactions:', err);
      setError('Failed to retrieve your transactions');
      setLoading(false);
      return [];
    }
  }, [currentUser]);
  
  // Create link token for Plaid Link
  const createLinkToken = useCallback(async () => {
    if (!currentUser) {
      logError('PlaidContext', 'Cannot create link token: No authenticated user');
      throw new Error('Authentication required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      log('PlaidContext', 'Creating link token');
      
      const response = await retryApiCall(() => apiService.getPlaidLinkToken());
      
      if (response && response.link_token) {
        setLinkToken(response.link_token);
        log('PlaidContext', 'Link token created successfully');
        setLoading(false);
        return response.link_token;
      } else {
        throw new Error('Invalid response from link token endpoint');
      }
    } catch (err) {
      logError('PlaidContext', 'Error creating link token:', err);
      setError('Failed to create Plaid link token');
      setLoading(false);
      throw err;
    }
  }, [currentUser]);
  
  // Check Plaid connection status
  const checkPlaidStatus = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      log('PlaidContext', 'Checking Plaid status');
      
      const status = await retryApiCall(() => apiService.getPlaidStatus());
      log('PlaidContext', 'Plaid status result:', status);
      
      setIsPlaidConnected(status.connected === true);
      
      // If connected, fetch accounts
      if (status.connected === true) {
        fetchPlaidAccounts();
      }
      
      setContextReady(true);
      setLoading(false);
    } catch (err) {
      logError('PlaidContext', 'Error checking Plaid status:', err);
      setError('Failed to check Plaid connection status');
      setIsPlaidConnected(false);
      setContextReady(true);
      setLoading(false);
    }
  }, [currentUser, fetchPlaidAccounts]);
  
  // Exchange public token for access token
  const exchangePublicToken = useCallback(async (publicToken) => {
    if (!currentUser || !publicToken) {
      logError('PlaidContext', 'Cannot exchange token: Missing user or public token');
      throw new Error('Missing required parameters');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      log('PlaidContext', 'Exchanging public token');
      
      const response = await retryApiCall(() => 
        apiService.exchangePlaidPublicToken(publicToken)
      );
      
      if (response && response.success) {
        log('PlaidContext', 'Public token exchanged successfully');
        setIsPlaidConnected(true);
        
        // Fetch accounts after successful connection
        await fetchPlaidAccounts();
        
        toast.success('Your account was successfully connected!');
        setLoading(false);
        return true;
      } else {
        throw new Error('Failed to exchange token');
      }
    } catch (err) {
      logError('PlaidContext', 'Error exchanging public token:', err);
      setError('Failed to connect your financial account');
      toast.error('Could not connect your account. Please try again.');
      setLoading(false);
      throw err;
    }
  }, [currentUser, fetchPlaidAccounts]);
  
  // Reset Plaid connection
  const resetPlaidConnection = useCallback(async () => {
    setLinkToken(null);
    setAccessToken(null);
    setIsPlaidConnected(false);
    setAccounts([]);
    setTransactions([]);
    setError(null);
    
    // Here you would typically call your API to disconnect Plaid
    toast.info('Plaid connection has been reset.');
    
    // Create a new link token for reconnection
    try {
      await createLinkToken();
    } catch (err) {
      logError('PlaidContext', 'Error creating new link token after reset:', err);
    }
  }, [createLinkToken]);
  
  // Create shared Plaid Link configuration
  const createSharedPlaidConfig = useCallback((token) => {
    if (!token) return null;
    
    return {
      token,
      onSuccess: async (publicToken, metadata) => {
        try {
          log('PlaidContext', 'Plaid Link success', { metadata });
          await exchangePublicToken(publicToken);
          toast.success('Account connected successfully!');
        } catch (err) {
          logError('PlaidContext', 'Error in Plaid Link success handler:', err);
          toast.error('Failed to connect account');
        }
      },
      onExit: (err, metadata) => {
        if (err) {
          logError('PlaidContext', 'Plaid Link exit with error:', err);
          toast.error(`Error connecting to bank: ${err.message || 'Unknown error'}`);
        }
        log('PlaidContext', 'Plaid Link exit', { metadata });
      },
      onEvent: (eventName, metadata) => {
        log('PlaidContext', 'Plaid Link event:', eventName, metadata);
      }
    };
  }, [exchangePublicToken]);

  // Update Plaid config when link token changes
  useEffect(() => {
    if (linkToken) {
      const config = createSharedPlaidConfig(linkToken);
      setPlaidConfig(config);
    }
  }, [linkToken, createSharedPlaidConfig]);
  
  // Initialize context
  useEffect(() => {
    if (currentUser) {
      checkPlaidStatus();
    } else {
      // Reset state when user is not authenticated
      setLinkToken(null);
      setAccessToken(null);
      setIsPlaidConnected(false);
      setAccounts([]);
      setTransactions([]);
      setError(null);
      setContextReady(false);
    }
  }, [currentUser, checkPlaidStatus]);
  
  // Memorize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    linkToken,
    isPlaidConnected,
    accounts, 
    transactions,
    loading,
    error,
    contextReady,
    plaidConfig,
    createLinkToken,
    exchangePublicToken,
    fetchPlaidAccounts,
    fetchPlaidTransactions,
    resetPlaidConnection,
    checkPlaidStatus
  }), [
    linkToken,
    isPlaidConnected,
    accounts,
    transactions, 
    loading,
    error,
    contextReady,
    plaidConfig,
    createLinkToken,
    exchangePublicToken,
    fetchPlaidAccounts,
    fetchPlaidTransactions,
    resetPlaidConnection,
    checkPlaidStatus
  ]);
  
  return (
    <PlaidContext.Provider value={contextValue}>
      {children}
    </PlaidContext.Provider>
  );
}

export default PlaidProvider; 