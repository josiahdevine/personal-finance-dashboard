import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { User } from '../types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const user = await response.json();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to login'
      });
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      const user = await response.json();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to register'
      });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to logout'
      });
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedUser = await response.json();
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to update profile'
      });
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to reset password'
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to update password'
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const user = await response.json();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (err) {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 