import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePlaid } from './PlaidContext';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

// Create context
const PlaidLinkContext = createContext();

// Hook to use Plaid Link context
export const usePlaidLink = () => {
  const context = useContext(PlaidLinkContext);
  if (!context) {
    throw new Error('usePlaidLink must be used within a PlaidLinkProvider');
  }
  return context;
};

// Provider component
export const PlaidLinkProvider = ({ children }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLinkReady, setIsLinkReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAccounts, refreshTransactions } = usePlaid();
  const { currentUser } = useAuth();

  // Create a link token
  const createLinkToken = useCallback(async () => {
    if (!currentUser) {
      console.error('User not authenticated');
      toast.error('Please log in to connect your accounts');
      return null;
    }

    setIsLoading(true);
    try {
      // Request a link token from your server
      const response = await api.post('/api/plaid/create-link-token', {
        user_id: currentUser.uid
      });

      if (response.data && response.data.link_token) {
        setLinkToken(response.data.link_token);
        setIsLinkReady(true);
        return response.data.link_token;
      } else {
        console.error('Invalid link token response', response.data);
        toast.error('Unable to initialize Plaid Link');
        return null;
      }
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error('Error connecting to financial services');
      
      // For development, create a mock token
      if (process.env.NODE_ENV === 'development') {
        const mockToken = `mock-link-token-${Date.now()}`;
        setLinkToken(mockToken);
        setIsLinkReady(true);
        console.log('Created mock link token for development:', mockToken);
        return mockToken;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Handle Plaid Link success
  const handleLinkSuccess = useCallback(async (publicToken, metadata) => {
    if (!currentUser) {
      console.error('User not authenticated');
      toast.error('Please log in to connect your accounts');
      return false;
    }

    setIsLoading(true);
    try {
      // Exchange public token for access token on your server
      const response = await api.post('/api/plaid/exchange-public-token', {
        public_token: publicToken,
        metadata: metadata,
        user_id: currentUser.uid
      });

      if (response.data && response.data.success) {
        toast.success('Account connected successfully!');
        
        // Refresh accounts and transactions
        await refreshAccounts();
        await refreshTransactions();
        
        return true;
      } else {
        console.error('Error exchanging public token:', response.data);
        toast.error('Failed to link account');
        return false;
      }
    } catch (error) {
      console.error('Error in handleLinkSuccess:', error);
      toast.error('Error linking your account');
      
      // For development, simulate success
      if (process.env.NODE_ENV === 'development') {
        toast.info('Using mock data for development');
        await refreshAccounts();
        await refreshTransactions();
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
      setLinkToken(null);
      setIsLinkReady(false);
    }
  }, [currentUser, refreshAccounts, refreshTransactions]);

  // Reset link state
  const resetLinkState = useCallback(() => {
    setLinkToken(null);
    setIsLinkReady(false);
  }, []);

  const value = {
    linkToken,
    isLinkReady,
    isLoading,
    createLinkToken,
    handleLinkSuccess,
    resetLinkState
  };

  return (
    <PlaidLinkContext.Provider value={value}>
      {children}
    </PlaidLinkContext.Provider>
  );
};

export default PlaidLinkContext; 