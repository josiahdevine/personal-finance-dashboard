import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/AuthService';
import { User } from '../models/types';

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createUserWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const authService = AuthService.getInstance();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          const dbUser = await authService.getCurrentUserFromDatabase();
          setUser(dbUser);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError(error instanceof Error ? error : new Error('Authentication error'));
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error instanceof Error ? error : new Error('Sign-in error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithEmail(email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      setError(error instanceof Error ? error : new Error('Sign-in error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createUserWithEmail = async (email: string, password: string, name = '') => {
    setError(null);
    try {
      await authService.createUserWithEmail(email, password, name);
    } catch (error) {
      console.error('Error creating user with email:', error);
      setError(error instanceof Error ? error : new Error('Sign-in error'));
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Sign-out error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    error,
    signInWithGoogle,
    signInWithEmail,
    createUserWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 