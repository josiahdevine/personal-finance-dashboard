import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously as _signInAnonymously,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
// Import Firebase initialization
import { auth, signInWithGoogle as firebaseSignInWithGoogle, ensureAuth } from '../services/firebase';
import { toast } from 'react-toastify';
import apiService from '../services/liveApi';
import { useNavigate } from 'react-router-dom';
import { log, logError, logRender, timeOperation } from '../utils/logger';
import ErrorBoundary from '../components/ErrorBoundary';

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
  const _authStateListenerSet = useRef(false);
  
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
          // Set persistence to local
          await setPersistence(authInstance, browserLocalPersistence);
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
      log('AuthContext', 'Firebase not initialized yet, waiting...');
      return;
    }

    try {
      log('AuthContext', 'Setting up auth state listener');
      const authInstance = ensureAuth();
      if (!authInstance) {
        throw new Error('Auth not available');
      }

      // Add debug info to help troubleshoot auth issues
      log('AuthContext', 'Auth configuration', {
        authDomain: authInstance.config.authDomain,
        currentHostname: window.location.hostname,
        apiKey: authInstance.config.apiKey ? '[PRESENT]' : '[MISSING]',
        persistence: localStorage.getItem('firebase:authUser') ? 'LOCAL' : 'NONE'
      });

      const unsubscribe = onAuthStateChanged(
        authInstance,
        (user) => {
          if (user) {
            log('AuthContext', 'User authenticated', { 
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified
            });
            setCurrentUser(user);
            setIsAuthenticated(true);
            
            // Store auth state in localStorage for debugging
            localStorage.setItem('auth_state', 'authenticated');
            localStorage.setItem('auth_timestamp', Date.now().toString());
          } else {
            log('AuthContext', 'No authenticated user');
            setCurrentUser(null);
            setIsAuthenticated(false);
            localStorage.setItem('auth_state', 'unauthenticated');
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
          localStorage.setItem('auth_error', JSON.stringify({
            code: error.code,
            message: error.message,
            time: new Date().toISOString()
          }));
        }
      );

      return () => unsubscribe();
    } catch (error) {
      logError('AuthContext', 'Error setting up auth state listener', error);
      setLoading(false);
      localStorage.setItem('auth_setup_error', JSON.stringify({
        message: error.message,
        time: new Date().toISOString()
      }));
    }
  }, [firebaseInitialized]);

  // Register a new user
  const register = async (email, password) => {
    return timeOperation('AuthContext', 'User registration', async () => {
      log('AuthContext', 'Register function called', { email });
      
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
        if (!email || !password) {
          const error = new Error('Missing required registration fields');
          logError('AuthContext', 'Registration validation failed', error, {
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
            username: userCredential.user.displayName,
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
        
        // Only navigate if we're in a browser environment
        if (typeof window !== 'undefined') {
          try {
            navigate('/login');
          } catch (navError) {
            // In test environment, just log the navigation
            console.log(`[Test] Navigation to: /login`);
          }
        }
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

  /**
   * Attempts to sign in anonymously
   * If a user already exists, returns the current user
   */
  const signInAsGuest = async () => {
    log('AuthContext', 'Attempting anonymous sign in');
    setLoading(true);
    setAuthError(null);
    
    try {
      // If we already have a user, return it
      if (currentUser) {
        log('AuthContext', 'User already exists, returning current user');
        setLoading(false);
        return currentUser;
      }
      
      // Check if Firebase is initialized
      if (!firebaseInitialized) {
        const error = new Error('Firebase not initialized');
        logError('AuthContext', 'Anonymous sign in failed', error);
        setAuthError(error);
        setLoading(false);
        throw error;
      }
      
      try {
        // Use the auth object directly instead of the imported function
        const userCredential = await auth.signInAnonymously();
        log('AuthContext', 'Anonymous sign in successful', { uid: userCredential.user.uid });
        
        // Authenticate with our backend
        try {
          const backendResponse = await apiService.login({
            firebaseUid: userCredential.user.uid,
            isAnonymous: true
          });
          
          log('AuthContext', 'Backend authentication successful', backendResponse);
        } catch (backendError) {
          logError('AuthContext', 'Backend authentication failed', backendError);
          // We still continue even if backend auth fails
        }
        
        setLoading(false);
        return userCredential.user;
      } catch (error) {
        // If anonymous auth is disabled, create a mock user
        if (error.code === 'auth/operation-not-allowed') {
          log('AuthContext', 'Anonymous auth disabled, creating mock user');
          
          // Create a mock user with a random UID
          const mockUid = `mock-${Math.random().toString(36).substring(2, 15)}`;
          
          // Try to authenticate with backend using the mock UID
          try {
            await apiService.login({
              firebaseUid: mockUid,
              isAnonymous: true
            });
            
            log('AuthContext', 'Backend authentication successful with mock user');
          } catch (backendError) {
            logError('AuthContext', 'Backend authentication failed with mock user', backendError);
            // We still continue even if backend auth fails
          }
          
          // Return a mock user object
          const mockUser = {
            uid: mockUid,
            isAnonymous: true,
            displayName: 'Guest User',
            email: null
          };
          
          setLoading(false);
          return mockUser;
        }
        
        // For other errors, log and throw
        logError('AuthContext', 'Anonymous sign in failed', error);
        setAuthError(error);
        setLoading(false);
        throw error;
      }
    } catch (error) {
      logError('AuthContext', 'Anonymous sign in failed', error);
      setAuthError(error);
      setLoading(false);
      throw error;
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
    signInAsGuest
  }), [currentUser, loading, isAuthenticated, authError, firebaseInitialized, register, login, logout, loginWithGoogle]);

  useEffect(() => {
    // Set persistence to LOCAL on mount
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('[Firebase] Auth persistence set to LOCAL successfully');
      })
      .catch((error) => {
        console.error('[Firebase] Error setting auth persistence:', error);
      });
  }, []);

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