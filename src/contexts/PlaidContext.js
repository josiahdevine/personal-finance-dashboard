import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
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
  
  // Add API check
  const [isApiInitialized, setIsApiInitialized] = useState(false);
  
  // Check if API is properly initialized
  useEffect(() => {
    const checkApiInitialization = async () => {
      try {
        // Verify that the API object exists (could be an object or function with Axios methods)
        if (!api) {
          throw new Error('API is undefined or null');
        }
        
        // Check if api has the necessary methods directly or as a function object
        const hasGetMethod = typeof api.get === 'function';
        const hasPostMethod = typeof api.post === 'function';
        
        if (!hasGetMethod || !hasPostMethod) {
          throw new Error('API missing required methods: ' + 
            (!hasGetMethod ? 'get ' : '') + 
            (!hasPostMethod ? 'post' : '')
          );
        }
        
        // Test API health check if available, but don't make it required
        try {
          if (typeof api.checkHealth === 'function') {
            const healthResult = await api.checkHealth();
            if (healthResult.status !== 'healthy') {
              console.warn('API health check warning:', healthResult.error);
            }
          }
        } catch (healthError) {
          // Log but don't fail just because health check failed
          console.warn('API health check failed but continuing:', healthError);
        }
        
        setIsApiInitialized(true);
        log('PlaidContext', 'API initialization verified ✓');
      } catch (error) {
        logError('PlaidContext', 'API initialization check failed', error);
        setIsApiInitialized(false);
        // Only show toast in production to avoid spamming in development
        if (process.env.NODE_ENV === 'production') {
          toast.error('Failed to initialize API connection. Please refresh the page.');
        }
      }
    };
    
    checkApiInitialization();
  }, []);

  // Log when context is mounted
  useEffect(() => {
    log('PlaidContext', 'PlaidProvider mounted');
    return () => {
      log('PlaidContext', 'PlaidProvider unmounted');
    };
  }, []);

  // Helper to use stored status as fallback - must be defined before it's used
  const getStoredStatusAsFallback = () => {
    try {
      const storedStatus = localStorage.getItem('plaidConnectionStatus');
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        setIsPlaidConnected(parsedStatus.isConnected);
        if (parsedStatus.accessToken) {
          setAccessToken(parsedStatus.accessToken);
        }
      } else {
        setIsPlaidConnected(false);
      }
    } catch (e) {
      logError('PlaidContext', 'Error in getStoredStatusAsFallback', e);
      setIsPlaidConnected(false);
    }
  };

  // Check if user is connected to Plaid
  const checkPlaidConnection = useCallback(async () => {
    if (!currentUser) {
      log('PlaidContext', 'No current user, setting isPlaidConnected to false');
      setIsPlaidConnected(false);
      setContextReady(true);
      return;
    }

    try {
      setLoading(true);
      log('PlaidContext', 'Checking Plaid connection status');
      
      // First try to get from localStorage
      const storedStatus = localStorage.getItem('plaidConnectionStatus');
      if (storedStatus) {
        try {
          const parsedStatus = JSON.parse(storedStatus);
          // Only use stored status if it's recent (less than 1 hour old)
          const isRecent = new Date().getTime() - parsedStatus.timestamp < 60 * 60 * 1000;
          
          if (isRecent) {
            log('PlaidContext', 'Using recent stored Plaid status', { 
              isConnected: parsedStatus.isConnected 
            });
            setIsPlaidConnected(parsedStatus.isConnected);
            if (parsedStatus.accessToken) {
              setAccessToken(parsedStatus.accessToken);
            }
            
            // Return early if we have recent stored status
            if (parsedStatus.isConnected) {
              setLoading(false);
              setContextReady(true);
              return;
            }
          }
        } catch (e) {
          logError('PlaidContext', 'Error parsing stored Plaid status', e);
          // Continue to API check if parsing fails
        }
      }
      
      // If no recent stored status, or status is not connected, check API
      if (!isApiInitialized) {
        logError('PlaidContext', 'API not properly initialized, using fallback');
        getStoredStatusAsFallback();
        setLoading(false);
        setContextReady(true);
        return;
      }
      
      try {
        log('PlaidContext', 'Checking Plaid connection via API');
        const response = await retryApiCall(() => api.get('/api/plaid/status'));
        const status = response?.data?.connected || false;
        
        log('PlaidContext', 'API returned Plaid status', { connected: status });
        setIsPlaidConnected(status);
        
        // Store in localStorage with timestamp
        localStorage.setItem('plaidConnectionStatus', JSON.stringify({
          isConnected: status,
          timestamp: new Date().getTime(),
          accessToken: response?.data?.accessToken || null
        }));
        
        if (response?.data?.accessToken) {
          setAccessToken(response.data.accessToken);
        }
      } catch (apiError) {
        logError('PlaidContext', 'Error checking Plaid connection via API', apiError);
        getStoredStatusAsFallback();
      }
    } catch (error) {
      logError('PlaidContext', 'Error in checkPlaidConnection', error);
      getStoredStatusAsFallback();
    } finally {
      setLoading(false);
      setContextReady(true);
    }
  }, [currentUser, isApiInitialized]);

  // Initialize connection check on mount and when user changes
  useEffect(() => {
    try {
      checkPlaidConnection();
    } catch (error) {
      logError('PlaidContext', 'Error in useEffect for checking Plaid connection', error);
      setIsPlaidConnected(false);
      setLoading(false);
      setContextReady(true);
    }
  }, [currentUser, checkPlaidConnection]);

  // Create link token - safely wrap API calls
  const createLinkToken = useCallback(async () => {
    if (!currentUser) {
      logError('PlaidContext', 'Cannot create link token without a user');
      toast.error('Please log in to connect your bank account');
      return null;
    }

    if (!isApiInitialized) {
      logError('PlaidContext', 'Cannot create link token - API not initialized');
      toast.error('Failed to create link token for Plaid - Connection issue');
      return null;
    }

    try {
      setLoading(true);
      log('PlaidContext', 'Creating Plaid link token');
      
      // Use retry mechanism for creating link token
      const response = await retryApiCall(() => api.post('/api/plaid/create-link-token', {
        userId: currentUser.uid
      }));
      
      const newLinkToken = response?.data?.link_token;
      if (newLinkToken) {
        log('PlaidContext', 'Successfully created link token');
        setLinkToken(newLinkToken);
        return newLinkToken;
      } else {
        throw new Error('No link token received from API');
      }
    } catch (error) {
      logError('PlaidContext', 'Error creating link token', error);
      setError('Failed to create link token');
      
      // Provide more specific error message based on the error
      let errorMessage = 'Failed to create link token for Plaid';
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Authentication error - please log in again';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error - please try again later';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Plaid error: ${error.response.data.error}`;
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error - please check your connection';
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, isApiInitialized]);

  // Mock transactions for testing
  const mockTransactions = [
    {
      id: 'tx1',
      date: '2023-05-15',
      name: 'Grocery Store',
      amount: -75.42,
      category: 'Food & Dining'
    },
    {
      id: 'tx2',
      date: '2023-05-14',
      name: 'Gas Station',
      amount: -45.00,
      category: 'Transportation'
    },
    {
      id: 'tx3',
      date: '2023-05-12',
      name: 'Salary Deposit',
      amount: 2500.00,
      category: 'Income'
    }
  ];

  // Safe method to get transactions with proper error handling
  const getTransactions = useCallback(async (startDate, endDate) => {
    if (!isPlaidConnected || !currentUser) {
      log('PlaidContext', 'Cannot get transactions - not connected or no user');
      return [];
    }

    try {
      setLoading(true);
      log('PlaidContext', 'Fetching transactions', { startDate, endDate });
      
      // Return mock transactions for now to avoid API errors
      log('PlaidContext', 'Returning mock transactions');
      return mockTransactions;
    } catch (error) {
      logError('PlaidContext', 'Error fetching transactions', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser, isPlaidConnected, mockTransactions]);

  // Value provided by this context
  const value = {
    linkToken,
    accessToken,
    isPlaidConnected,
    accounts,
    transactions,
    loading,
    error,
    contextReady,
    checkPlaidConnection,
    createLinkToken,
    getTransactions
  };

  return (
    <PlaidContext.Provider value={value}>
      {children}
    </PlaidContext.Provider>
  );
}

export default PlaidProvider; 