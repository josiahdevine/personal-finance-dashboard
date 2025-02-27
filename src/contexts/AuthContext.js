import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously
} from 'firebase/auth';
// Import Firebase initialization
import { auth, signInWithGoogle as firebaseSignInWithGoogle, ensureAuth } from '../services/firebase';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import { log, logError, logRender, timeOperation } from '../utils/logger';
import ErrorBoundary from '../Components/ErrorBoundary';

log('AuthContext', 'Initializing AuthContext module');

// Create the Auth Context
export const AuthContext = createContext();
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
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const navigate = useNavigate();
  const authStateListenerSet = useRef(false);
  
  log('AuthContext', 'AuthProvider state initialized', { 
    currentUserExists: currentUser !== null,
    loading,
    isAuthenticated,
    hasAuthError: !!authError,
    firebaseInitialized
  });

  // Check Firebase initialization status
  useEffect(() => {
    const checkFirebaseInit = async () => {
      try {
        // Try to get the auth instance
        const authInstance = ensureAuth();
        if (authInstance) {
          setFirebaseInitialized(true);
          return true;
        }
        return false;
      } catch (error) {
        logError('AuthContext', 'Error checking Firebase initialization', error);
        return false;
      }
    };

    // Initial check
    checkFirebaseInit();

    // Set up retry mechanism if not initialized
    if (!firebaseInitialized) {
      const retryInterval = setInterval(async () => {
        const initialized = await checkFirebaseInit();
        if (initialized) {
          clearInterval(retryInterval);
        }
      }, 1000);

      // Cleanup
      return () => clearInterval(retryInterval);
    }
  }, []);

  // Handle auth state changes with Firebase
  useEffect(() => {
    if (!firebaseInitialized) {
      return;
    }

    try {
      const authInstance = ensureAuth();
      if (!authInstance) {
        throw new Error('Auth not available');
      }

      const unsubscribe = onAuthStateChanged(
        authInstance,
        (user) => {
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
          setLoading(false);
        },
        (error) => {
          logError('AuthContext', 'Auth state change error', error);
          setAuthError({
            message: 'Error monitoring authentication state',
            code: error.code
          });
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      logError('AuthContext', 'Error setting up auth state listener', error);
      setLoading(false);
    }
  }, [firebaseInitialized]);

  // Register a new user
  const register = async (username, email, password) => {
    return timeOperation('AuthContext', 'User registration', async () => {
      log('AuthContext', 'Register function called', { username, email });
      
      try {
        // Reset any previous auth errors
        setAuthError(null);
        setLoading(true);
        log('AuthContext', 'Loading state set to true for registration');
        
        // Check if Firebase is initialized
        if (!firebaseInitialized) {
          const error = new Error('Authentication service is not initialized');
          logError('AuthContext', 'Registration failed - Firebase not initialized', error);
          setAuthError({
            message: 'Authentication service is not available',
            code: 'auth/not-initialized'
          });
          throw error;
        }
        
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
            case 'auth/not-initialized':
              errorMessage = 'Authentication service is not available. Please try again later.';
              break;
            default:
              errorMessage = `Registration failed: ${error.message}`;
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

  // Login a user - with improved error handling
  const login = async (email, password) => {
    return timeOperation('AuthContext', 'User login', async () => {
      log('AuthContext', 'Login function called', { email });
      
      try {
        // Reset any previous auth errors
        setAuthError(null);
        setLoading(true);
        log('AuthContext', 'Loading state set to true for login');
        
        // Check if Firebase is initialized
        if (!firebaseInitialized) {
          const error = new Error('Authentication service is not initialized');
          logError('AuthContext', 'Login failed - Firebase not initialized', error);
          setAuthError({
            message: 'Authentication service is not available',
            code: 'auth/not-initialized'
          });
          throw error;
        }
        
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
            case 'auth/not-initialized':
              errorMessage = 'Authentication service is not available. Please try again later.';
              break;
            default:
              errorMessage = `Login failed: ${error.message}`;
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

  // Add loginWithGoogle function
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      log('AuthContext', 'Attempting Google sign in');
      const result = await firebaseSignInWithGoogle();
      
      if (result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('auth_provider', 'google');
        log('AuthContext', 'Google sign in successful', { uid: result.user.uid });
        
        // Update user data in backend if needed
        try {
          await apiService.post('/api/users/auth', { 
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            provider: 'google'
          });
        } catch (apiError) {
          console.warn('Failed to update user data in backend:', apiError);
        }
        
        return result.user;
      }
    } catch (error) {
      logError('AuthContext', 'Google sign in failed', error);
      setAuthError(error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add anonymous sign-in method
  const signInAnonymously = async () => {
    log('AuthContext', 'Attempting anonymous sign in');
    try {
      setLoading(true);
      
      // Check if already signed in
      if (currentUser) {
        log('AuthContext', 'User already signed in - skipping anonymous sign in');
        return currentUser;
      }
      
      // Check if Firebase is initialized
      if (!firebaseInitialized) {
        throw new Error('Authentication service is not initialized');
      }
      
      try {
        // Try Firebase anonymous auth
        const userCredential = await firebaseSignInAnonymously(auth);
        log('AuthContext', 'Anonymous sign in successful', { uid: userCredential.user.uid });
        
        // Authenticate with our backend
        try {
          const backendResponse = await apiService.login({
            firebaseUid: userCredential.user.uid,
            isAnonymous: true
          });
          log('AuthContext', 'Backend anonymous auth successful', backendResponse);
        } catch (backendError) {
          logError('AuthContext', 'Backend anonymous auth failed but Firebase auth succeeded', backendError);
          // We'll still continue since Firebase auth succeeded
        }
        
        return userCredential.user;
      } catch (firebaseError) {
        // If anonymous auth is disabled, create a mock user
        if (firebaseError.code === 'auth/admin-restricted-operation' || 
            firebaseError.code === 'auth/operation-not-allowed') {
          
          log('AuthContext', 'Anonymous auth disabled, using mock user');
          
          // Create a mock user that mimics Firebase user
          const mockUser = {
            uid: 'mock-user-' + Date.now(),
            isAnonymous: true,
            displayName: 'Guest User',
            email: null,
            emailVerified: false,
            // Add other properties as needed
            getIdToken: () => Promise.resolve('mock-token-' + Date.now())
          };
          
          // Store in session storage to persist during session
          sessionStorage.setItem('mockUser', JSON.stringify({
            ...mockUser,
            timestamp: Date.now()
          }));
          
          // Call API login with mock user
          try {
            await apiService.login({ firebaseUid: mockUser.uid, isAnonymous: true });
            log('AuthContext', 'Backend mock auth successful');
          } catch (apiError) {
            logError('AuthContext', 'Backend mock auth failed', apiError);
          }
          
          setCurrentUser(mockUser);
          setIsAuthenticated(true);
          return mockUser;
        }
        
        // For other Firebase errors, throw
        throw firebaseError;
      }
    } catch (error) {
      logError('AuthContext', 'Anonymous sign in failed', error);
      setAuthError({ 
        message: 'Failed to sign in anonymously: ' + error.message, 
        code: error.code 
      });
      toast.error('Failed to sign in. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Make sure value is properly memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    loading,
    isAuthenticated,
    authError,
    register,
    login,
    logout,
    loginWithGoogle,
    signInAnonymously
  }), [currentUser, loading, isAuthenticated, authError, firebaseInitialized, register, login, logout, loginWithGoogle]);

  return (
    <ErrorBoundary componentName="AuthProvider" showDetails={process.env.NODE_ENV === 'development'}>
      <AuthContext.Provider value={value}>
        {!loading ? children : (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

log('AuthContext', 'Exporting AuthContext module');
export default AuthContext; 