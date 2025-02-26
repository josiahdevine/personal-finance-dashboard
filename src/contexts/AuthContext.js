import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
// Import Firebase initialization
import { auth, signInWithGoogle as firebaseSignInWithGoogle } from '../services/firebase';
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
    const checkFirebaseInit = () => {
      try {
        // Check localStorage for firebase initialization status
        const firebaseInitError = localStorage.getItem('firebase_init_error');
        const authInitTimestamp = localStorage.getItem('auth_init_timestamp');
        
        if (authInitTimestamp) {
          // Firebase was successfully initialized
          log('AuthContext', 'Firebase initialization detected', { timestamp: authInitTimestamp });
          setFirebaseInitialized(true);
          return true;
        } else if (firebaseInitError) {
          // There was an error initializing Firebase
          try {
            const errorInfo = JSON.parse(firebaseInitError);
            logError('AuthContext', 'Firebase initialization error detected', new Error(errorInfo.message), errorInfo);
            setAuthError({
              message: 'Authentication service failed to initialize',
              code: 'auth/initialization-failed',
              details: errorInfo
            });
          } catch (e) {
            logError('AuthContext', 'Failed to parse Firebase init error', e);
          }
          return false;
        }
        
        // Check if auth is accessible directly
        if (auth) {
          log('AuthContext', 'Firebase auth object is available');
          setFirebaseInitialized(true);
          return true;
        }
        
        return false;
      } catch (error) {
        logError('AuthContext', 'Error checking Firebase initialization', error);
        return false;
      }
    };
    
    // Perform the initial check
    const isInitialized = checkFirebaseInit();
    
    // If not initialized yet, set up a retry mechanism
    if (!isInitialized) {
      log('AuthContext', 'Firebase not initialized yet, setting up retry checks');
      
      let retryCount = 0;
      const maxRetries = 5;
      const intervalId = setInterval(() => {
        retryCount++;
        log('AuthContext', `Retry ${retryCount}/${maxRetries} checking Firebase initialization`);
        
        if (checkFirebaseInit() || retryCount >= maxRetries) {
          clearInterval(intervalId);
          
          if (retryCount >= maxRetries && !firebaseInitialized) {
            log('AuthContext', 'Max retries reached, Firebase still not initialized');
            setAuthError({
              message: 'Authentication service could not be initialized',
              code: 'auth/initialization-timeout'
            });
            setLoading(false); // Allow app to load even without auth
          }
        }
      }, 2000); // Check every 2 seconds
      
      return () => clearInterval(intervalId);
    }
  }, []);

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

  // Handle auth state changes with Firebase - Enhanced retry mechanism
  useEffect(() => {
    log('AuthContext', 'Setting up auth state listener', { firebaseInitialized });
    
    // Wait for Firebase to be initialized before setting up the auth state listener
    if (!firebaseInitialized) {
      log('AuthContext', 'Delaying auth state listener until Firebase is initialized');
      return;
    }
    
    if (!auth) {
      logError('AuthContext', 'Auth not available for state listener', new Error('Auth not initialized'));
      setLoading(false);
      return;
    }
    
    try {
      // Create the unsubscribe function for the auth state listener
      const unsubscribe = onAuthStateChanged(
        auth, 
        (user) => {
          log('AuthContext', 'Auth state changed', { userExists: !!user });
          
          if (user) {
            // Make sure we handle the user data properly before updating state
            const safeUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              // Do not include complex Firebase objects that can't be serialized
              // This prevents issues with rendering
            };
            
            setCurrentUser(safeUser);
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
      
      // Set the flag that the listener is active
      authStateListenerSet.current = true;
      
      return () => {
        log('AuthContext', 'Cleaning up auth state listener');
        unsubscribe();
        authStateListenerSet.current = false;
      };
    } catch (error) {
      logError('AuthContext', 'Error setting up auth state listener', error);
      setAuthError({ 
        message: 'Error initializing authentication', 
        code: error.code 
      });
      setLoading(false);
    }
  }, [firebaseInitialized]);

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

  // Make sure value is properly memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    loading,
    isAuthenticated,
    authError,
    register,
    login,
    logout,
    loginWithGoogle
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