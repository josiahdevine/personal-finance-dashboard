import { useState, useCallback, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { User } from '../types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed'
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      // TODO: Replace with actual API call
      await fetch('/api/auth/logout', { method: 'POST' });
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Logout failed'
      }));
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
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
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Registration failed'
      }));
    }
  }, []);

  const { execute: updateProfile } = useAsyncAction(async (updates: Partial<User>) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    setState(prev => ({ ...prev, user: data.user, error: null }));
  });

  const { execute: updatePassword } = useAsyncAction(async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwords),
    });

    if (!response.ok) {
      throw new Error('Failed to update password');
    }
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const user = await response.json();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Add a stub for signInWithGoogle
  const signInWithGoogle = useCallback(async () => {
    return Promise.reject('Not implemented');
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    signInWithEmail: login,
    signInWithGoogle,
    signOut: logout,
    register,
    updateProfile,
    updatePassword,
  };
};