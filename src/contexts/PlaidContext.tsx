import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Account, Transaction } from '../types/models';

// Export a type to ensure this file is treated as a module
export type PlaidContextType = ReturnType<typeof usePlaid>;

export interface PlaidState {
  isLoading: boolean;
  error: string | null;
  linkToken: string | null;
  accounts: Account[];
  transactions: Transaction[];
  lastSync: string | null;
}

type PlaidAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LINK_TOKEN'; payload: string }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SET_LAST_SYNC'; payload: string };

const initialState: PlaidState = {
  isLoading: false,
  error: null,
  linkToken: null,
  accounts: [],
  transactions: [],
  lastSync: null
};

const PlaidContext = createContext<{
  state: PlaidState;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLinkToken: (token: string) => void;
  setAccounts: (accounts: Account[]) => void;
  updateAccount: (account: Account) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  setLastSync: (date: string) => void;
} | null>(null);

const plaidReducer = (state: PlaidState, action: PlaidAction): PlaidState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LINK_TOKEN':
      return { ...state, linkToken: action.payload };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        )
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    default:
      return state;
  }
};

export const PlaidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(plaidReducer, initialState);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLinkToken = useCallback((token: string) => {
    dispatch({ type: 'SET_LINK_TOKEN', payload: token });
  }, []);

  const setAccounts = useCallback((accounts: Account[]) => {
    dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
  }, []);

  const updateAccount = useCallback((account: Account) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  }, []);

  const setTransactions = useCallback((transactions: Transaction[]) => {
    dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  }, []);

  const updateTransaction = useCallback((transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  }, []);

  const setLastSync = useCallback((date: string) => {
    dispatch({ type: 'SET_LAST_SYNC', payload: date });
  }, []);

  return (
    <PlaidContext.Provider
      value={{
        state,
        setLoading,
        setError,
        setLinkToken,
        setAccounts,
        updateAccount,
        setTransactions,
        addTransaction,
        updateTransaction,
        setLastSync
      }}
    >
      {children}
    </PlaidContext.Provider>
  );
};

export const usePlaid = () => {
  const context = useContext(PlaidContext);
  if (!context) {
    throw new Error('usePlaid must be used within a PlaidProvider');
  }
  
  // Return both the context and the state properties for backward compatibility
  return {
    ...context,
    ...context.state,
    refreshAccounts: () => {
      context.setLoading(true);
      // This is a placeholder. In a real app, you would call an API to refresh accounts.
      setTimeout(() => {
        context.setLoading(false);
      }, 1000);
    }
  };
};

export default PlaidProvider;
