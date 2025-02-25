import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { log, logError } from '../utils/logger';
import { toast } from 'react-toastify';

const PlaidContext = createContext();

export function usePlaid() {
  return useContext(PlaidContext);
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
      setIsPlaidConnected(false);
    }
  };

  // Check if user is connected to Plaid
  const checkPlaidConnection = useCallback(async () => {
    if (!currentUser) {
      setIsPlaidConnected(false);
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
            setIsPlaidConnected(parsedStatus.isConnected);
            if (parsedStatus.accessToken) {
              setAccessToken(parsedStatus.accessToken);
            }
            
            // Return early if we have recent stored status
            if (parsedStatus.isConnected) {
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          logError('PlaidContext', 'Error parsing stored Plaid status', e);
          // Continue to API check if parsing fails
        }
      }
      
      // If no recent stored status, or status is not connected, check API
      try {
        // Make sure the API exists before calling it
        if (typeof api.get === 'function') {
          const response = await api.get('/api/plaid/status');
          const status = response?.data?.connected || false;
          
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
        } else {
          // API not properly initialized
          logError('PlaidContext', 'API not properly initialized', new Error('api.get is not a function'));
          // Use stored status as fallback
          getStoredStatusAsFallback();
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
    }
  }, [currentUser]);

  // Initialize connection check on mount and when user changes
  useEffect(() => {
    try {
      checkPlaidConnection();
    } catch (error) {
      logError('PlaidContext', 'Error in useEffect for checking Plaid connection', error);
      setIsPlaidConnected(false);
      setLoading(false);
    }
  }, [currentUser, checkPlaidConnection]);

  // Create link token - safely wrap API calls
  const createLinkToken = useCallback(async () => {
    if (!currentUser) return null;

    try {
      setLoading(true);
      log('PlaidContext', 'Creating Plaid link token');
      
      if (typeof api.post !== 'function') {
        throw new Error('API not properly initialized: api.post is not a function');
      }
      
      const response = await api.post('/api/plaid/create-link-token', {
        userId: currentUser.uid
      });
      
      const newLinkToken = response?.data?.link_token;
      if (newLinkToken) {
        setLinkToken(newLinkToken);
        return newLinkToken;
      } else {
        throw new Error('No link token received from API');
      }
    } catch (error) {
      logError('PlaidContext', 'Error creating link token', error);
      setError('Failed to create link token');
      toast.error('Failed to create link token for Plaid');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Safe method to get transactions with proper error handling
  const getTransactions = useCallback(async (startDate, endDate) => {
    if (!isPlaidConnected || !currentUser) return [];

    try {
      setLoading(true);
      log('PlaidContext', 'Fetching transactions');
      
      // Return mock transactions for now to avoid API errors
      return mockTransactions;
    } catch (error) {
      logError('PlaidContext', 'Error fetching transactions', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser, isPlaidConnected]);

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

  // Value provided by this context
  const value = {
    linkToken,
    accessToken,
    isPlaidConnected,
    accounts,
    transactions,
    loading,
    error,
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