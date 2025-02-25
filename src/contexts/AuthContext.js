import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
// Import Firebase initialization
import { auth } from '../services/firebase';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import { log, logError, logRender, timeOperation } from '../utils/logger';
import ErrorBoundary from '../components/ErrorBoundary';

log('AuthContext', 'Initializing AuthContext module');

// Create the Auth Context
const AuthContext = createContext();
log('AuthContext', 'AuthContext created', { contextCreated: !!AuthContext });

// Custom hook to use the Auth Context
export const useAuth = () => {
  log('AuthContext', 'useAuth hook called');
  const context = useContext(AuthContext);
  if (!context) {
    const error = new Error('useAuth must be used within an AuthProvider');
    logError('AuthContext', 'useAuth hook used outside AuthProvider', error);
    throw error;
  }
  return context;
};

// Auth Context Provider Component
export const AuthProvider = ({ children }) => {
  logRender('AuthProvider', { hasChildren: !!children });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const authStateListenerSet = useRef(false);
  
  log('AuthContext', 'AuthProvider state initialized', { 
    currentUserExists: currentUser !== null,
    loading,
    isAuthenticated,
    hasAuthError: !!authError
  });

  // Register a new user
  const register = async (username, email, password) => {
    return timeOperation('AuthContext', 'User registration', async () => {
      log('AuthContext', 'Register function called', { username, email });
      
      try {
        // Reset any previous auth errors
        setAuthError(null);
        setLoading(true);
        log('AuthContext', 'Loading state set to true for registration');
        
        // Validate inputs
        if (!username || !email || !password) {
          const error = new Error('Missing required registration fields');
          logError('AuthContext', 'Registration validation failed', error, {
            hasUsername: !!username,
            hasEmail: !!email,
            hasPassword: !!password
          });
          throw error;
        }
        
        // Check if auth is available
        if (!auth) {
          const error = new Error('Authentication service is not available');
          logError('AuthContext', 'Auth object is not available', error);
          throw error;
        }
        
        if (!createUserWithEmailAndPassword) {
          const error = new Error('Registration service is not available');
          logError('AuthContext', 'createUserWithEmailAndPassword function is not available', error);
          throw error;
        }
        
        // First, create the user in Firebase
        log('AuthContext', 'Creating Firebase user', { email });
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        log('AuthContext', 'Firebase user created successfully', { 
          uid: userCredential.user.uid,
          emailVerified: userCredential.user.emailVerified
        });

        // Then, register the user in our backend
        log('AuthContext', 'Registering user in backend');
        try {
          await apiService.register({
            username,
            email,
            password,
            firebaseUid: userCredential.user.uid
          });
          log('AuthContext', 'Backend registration successful');
        } catch (backendError) {
          logError('AuthContext', 'Backend registration failed but Firebase registration succeeded', backendError, {
            uid: userCredential.user.uid,
            email
          });
          // We'll still continue since Firebase auth succeeded
          // In a production app, you might want to delete the Firebase user or try to recover
        }
        
        toast.success('Registration successful! You can now log in.');
        log('AuthContext', 'Registration completed successfully');
        return userCredential.user;
      } catch (error) {
        // Format and log the error
        const errorDetails = {
          code: error.code,
          message: error.message,
          email
        };
        
        // Set friendly error message based on Firebase error code
        let errorMessage = 'Failed to register. Please try again.';
        if (error.code) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already registered.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email format.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password is too weak. Use at least 6 characters.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Check your connection and try again.';
              break;
          }
        }
        
        setAuthError({ message: errorMessage, code: error.code });
        logError('AuthContext', 'Registration failed', error, errorDetails);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        log('AuthContext', 'Loading state set to false after registration');
      }
    });
  };

  // Login a user
  const login = async (email, password) => {
    return timeOperation('AuthContext', 'User login', async () => {
      log('AuthContext', 'Login function called', { email });
      
      try {
        // Reset any previous auth errors
        setAuthError(null);
        setLoading(true);
        log('AuthContext', 'Loading state set to true for login');
        
        // Validate inputs
        if (!email || !password) {
          const error = new Error('Missing email or password');
          logError('AuthContext', 'Login validation failed', error, {
            hasEmail: !!email,
            hasPassword: !!password
          });
          throw error;
        }
        
        // Check if auth is available
        if (!auth) {
          const error = new Error('Authentication service is not available');
          logError('AuthContext', 'Auth object is not available for login', error);
          throw error;
        }
        
        if (!signInWithEmailAndPassword) {
          const error = new Error('Login service is not available');
          logError('AuthContext', 'signInWithEmailAndPassword function is not available', error);
          throw error;
        }
        
        // First, authenticate with Firebase
        log('AuthContext', 'Logging in with Firebase', { email });
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        log('AuthContext', 'Firebase login successful', { 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        });
        
        // Then authenticate with our backend
        log('AuthContext', 'Authenticating with backend');
        try {
          const backendResponse = await apiService.login({
            email,
            password,
            firebaseUid: userCredential.user.uid
          });
          log('AuthContext', 'Backend authentication successful', { backendResponseReceived: !!backendResponse });
        } catch (backendError) {
          logError('AuthContext', 'Backend login failed but Firebase login succeeded', backendError, {
            uid: userCredential.user.uid
          });
          // We'll still continue since Firebase auth succeeded
        }
        
        // Update authentication state
        setIsAuthenticated(true);
        log('AuthContext', 'isAuthenticated set to true');
        
        toast.success('Login successful!');
        return userCredential.user;
      } catch (error) {
        // Format and log the error
        const errorDetails = {
          code: error.code,
          message: error.message,
          email
        };
        
        // Set friendly error message based on Firebase error code
        let errorMessage = 'Failed to log in. Please check your credentials.';
        if (error.code) {
          switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              errorMessage = 'Invalid email or password.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email format.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed login attempts. Try again later.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Check your connection and try again.';
              break;
          }
        }
        
        setAuthError({ message: errorMessage, code: error.code });
        logError('AuthContext', 'Login failed', error, errorDetails);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        log('AuthContext', 'Loading state set to false after login');
      }
    });
  };

  // Logout the user
  const logout = async () => {
    return timeOperation('AuthContext', 'User logout', async () => {
      log('AuthContext', 'Logout function called');
      
      try {
        setLoading(true);
        setAuthError(null);
        log('AuthContext', 'Loading state set to true for logout');
        
        // Check if auth is available
        if (!auth) {
          const error = new Error('Authentication service is not available');
          logError('AuthContext', 'Auth object is not available for logout', error);
          throw error;
        }
        
        if (!signOut) {
          const error = new Error('Logout service is not available');
          logError('AuthContext', 'signOut function is not available', error);
          throw error;
        }
        
        // First logout from Firebase
        await signOut(auth);
        log('AuthContext', 'Firebase logout successful');
        
        // Then logout from backend
        try {
          await apiService.logout();
          log('AuthContext', 'Backend logout successful');
        } catch (backendError) {
          logError('AuthContext', 'Backend logout failed but Firebase logout succeeded', backendError);
          // Continue logout process regardless
        }
        
        // Update authentication state
        setCurrentUser(null);
        setIsAuthenticated(false);
        log('AuthContext', 'User logged out, state reset');
        
        toast.info('You have been logged out.');
        navigate('/login');
      } catch (error) {
        logError('AuthContext', 'Logout failed', error);
        toast.error('Failed to log out. ' + error.message);
        setAuthError({ message: 'Failed to log out. Please try again.', code: error.code });
      } finally {
        setLoading(false);
        log('AuthContext', 'Loading state set to false after logout');
      }
    });
  };

  // Set up the authentication state listener
  useEffect(() => {
    if (authStateListenerSet.current) {
      log('AuthContext', 'Auth state listener already set up, skipping');
      return;
    }
    
    log('AuthContext', 'Setting up auth state listener');
    
    // Check if auth is available
    if (!auth) {
      logError('AuthContext', 'Auth object is not available for auth state listener', 
        new Error('Auth not initialized'));
      setLoading(false);
      return;
    }
    
    if (!onAuthStateChanged) {
      logError('AuthContext', 'onAuthStateChanged function is not available', 
        new Error('Auth function not available'));
      setLoading(false);
      return;
    }
    
    authStateListenerSet.current = true;
    
    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        log('AuthContext', 'Auth state changed', {
          user: user ? { uid: user.uid, email: user.email, verified: user.emailVerified } : null,
          authenticated: !!user
        });
        
        setCurrentUser(user);
        setIsAuthenticated(!!user);
        setLoading(false);
      },
      (error) => {
        logError('AuthContext', 'Auth state listener error', error);
        setAuthError({ message: 'Authentication error. Please try refreshing the page.', code: error.code });
        setLoading(false);
      }
    );

    // Clean up the listener on component unmount
    return () => {
      log('AuthContext', 'Cleaning up auth state listener');
      authStateListenerSet.current = false;
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The context value that will be provided
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    authError,
    register,
    login,
    logout
  };

  log('AuthContext', 'Rendering AuthContext.Provider', { 
    currentUserExists: !!currentUser,
    isAuthenticated,
    loading,
    hasAuthError: !!authError
  });

  return (
    <AuthContext.Provider value={value}>
      <ErrorBoundary componentName="AuthProvider">
        {!loading ? children : (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading authentication...</p>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-4 text-xs text-gray-500 p-2 bg-gray-100 rounded">
                {JSON.stringify({loading, currentUser: !!currentUser, isAuthenticated, hasError: !!authError}, null, 2)}
              </pre>
            )}
          </div>
        )}
      </ErrorBoundary>
    </AuthContext.Provider>
  );
};

log('AuthContext', 'Exporting AuthContext module');
export default AuthContext; 