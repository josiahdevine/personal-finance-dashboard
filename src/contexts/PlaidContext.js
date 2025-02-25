import React, { createContext, useState, useContext, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const PlaidContext = createContext();

export function usePlaid() {
  return useContext(PlaidContext);
}

export function PlaidProvider({ children }) {
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createLinkToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/create-link-token', {
        userId: user?.uid
      });
      setLinkToken(response.data.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        await axios.post('/api/exchange-public-token', {
          public_token,
          userId: user?.uid
        });
        // Refresh accounts after successful connection
        fetchAccounts();
      } catch (error) {
        console.error('Error exchanging public token:', error);
      }
    },
    onExit: (err, metadata) => {
      // Handle exit
      if (err != null) {
        console.error('Plaid Link error:', err);
      }
    }
  });

  const fetchAccounts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/accounts/${user.uid}`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = {
    linkToken,
    accounts,
    loading,
    ready,
    createLinkToken,
    open,
    fetchAccounts
  };

  return (
    <PlaidContext.Provider value={value}>
      {children}
    </PlaidContext.Provider>
  );
} 