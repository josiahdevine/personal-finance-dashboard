import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as _firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../services/firebase';
import logger from '../utils/logger.js';
import type { User } from '../types/models';
import { validateUser } from '../types/guards';

interface AuthContextType {
  user: User | undefined;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  state: {
    user: User | undefined;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
  };
  currentUser: User | undefined;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createUserWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

const mapFirebaseUser = async (firebaseUser: FirebaseUser | null): Promise<User | undefined> => {
  if (!firebaseUser) return undefined;
  
  try {
    // Fetch additional user data from your database here
    const response = await fetch(`/api/users/${firebaseUser.uid}`);
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
      console.warn("Received non-JSON response from user API");
      // Return basic user info without attempting to parse JSON
      const basicUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          theme: 'system',
          notifications: true,
          currency: 'USD'
        }
      };
      return validateUser(basicUser) ? basicUser : undefined;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    const mappedUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
      settings: {
        theme: userData.settings?.theme || 'system',
        notifications: userData.settings?.notifications ?? true,
        currency: userData.settings?.currency || 'USD'
      },
      ...userData
    };
    
    return validateUser(mappedUser) ? mappedUser : undefined;
  } catch (error) {
    logger.logError('AuthContext', 'Error fetching user data', error as Error);
    // Return basic user data if database fetch fails
    const fallbackUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'system',
        notifications: true,
        currency: 'USD'
      }
    };
    return validateUser(fallbackUser) ? fallbackUser : undefined;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get the isAuthenticated value from both firebaseUser and user
  const isAuthenticated = Boolean(firebaseUser && user);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      logger.logError('AuthContext', 'Google sign in error', error as Error);
      setError(error instanceof Error ? error : new Error('Google sign-in failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      logger.logError('AuthContext', 'Email sign in error', error as Error);
      setError(error instanceof Error ? error : new Error('Email sign-in failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createUserWithEmail = async (email: string, password: string, name = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await firebaseUpdateProfile(newUser, { displayName: name });
      }
      
      // Create user profile in your database
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: newUser.uid,
          email: newUser.email,
          displayName: name || null,
        }),
      });
    } catch (error) {
      logger.logError('AuthContext', 'User creation error', error as Error);
      setError(error instanceof Error ? error : new Error('Failed to create user'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await auth.signOut();
      setUser(undefined);
      localStorage.removeItem('user');
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error during sign out'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!firebaseUser) throw new Error('No user logged in');

      // Update Firebase profile
      const firebaseUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.name) firebaseUpdates.displayName = updates.name;
      
      if (Object.keys(firebaseUpdates).length > 0) {
        await firebaseUpdateProfile(firebaseUser, firebaseUpdates);
      }

      // Update additional user data in your database
      const response = await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update user profile');

      const updatedUser: User = await response.json();
      setUser(updatedUser);
    } catch (error) {
      logger.logError('AuthContext', 'Profile update error', error as Error);
      setError(error instanceof Error ? error : new Error('Failed to update profile'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      logger.logError('AuthContext', 'Password reset error', error as Error);
      setError(error instanceof Error ? error : new Error('Failed to reset password'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user before password update
      await signInWithEmailAndPassword(auth, firebaseUser.email, currentPassword);
      await firebaseUpdatePassword(firebaseUser, newPassword);
    } catch (error) {
      logger.logError('AuthContext', 'Password update error', error as Error);
      setError(error instanceof Error ? error : new Error('Failed to update password'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    error,
    state: {
      user,
      isAuthenticated,
      isLoading,
      error
    },
    currentUser: user,
    signInWithGoogle,
    signInWithEmail,
    createUserWithEmail,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
    login: signInWithEmail,  // Alias for signInWithEmail
    register: createUserWithEmail  // Alias for createUserWithEmail
  };

  // Initialize Firebase auth state listener
  useEffect(() => {
    setIsLoading(true);
    
    // Persist the auth state
    const persistedUser = localStorage.getItem('user');
    if (persistedUser) {
      try {
        const parsedUser: User = JSON.parse(persistedUser);
        if (validateUser(parsedUser)) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Error parsing persisted user data:', err);
        localStorage.removeItem('user');
      }
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      try {
        if (firebaseUser) {
          const mappedUser = await mapFirebaseUser(firebaseUser);
          setUser(mappedUser);
          
          // Persist the user data
          if (mappedUser) {
            localStorage.setItem('user', JSON.stringify(mappedUser));
          }
        } else {
          setUser(undefined);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error mapping Firebase user:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during authentication'));
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}