import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { log, logError, timeOperation } from '../utils/logger';

// Initialize Firebase
let app;
let auth;

// Production mode should be less verbose
const isProduction = process.env.NODE_ENV === 'production';
// Simplify platform detection - focus only on Netlify vs custom domain
const isNetlify = window.location.hostname.includes('netlify.app');
const isTryPersonalFinance = window.location.hostname.includes('trypersonalfinance.com');
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Add detailed logging for Firebase configuration troubleshooting
console.log('[Firebase Debug] Environment Info:', {
  isProduction,
  isNetlify,
  isTryPersonalFinance,
  isLocalhost,
  hostname: window.location.hostname,
  origin: window.location.origin,
  env: process.env.NODE_ENV,
  apiKeyExists: !!process.env.REACT_APP_FIREBASE_API_KEY,
  apiKeyLength: process.env.REACT_APP_FIREBASE_API_KEY ? process.env.REACT_APP_FIREBASE_API_KEY.length : 0,
  currentDeployment: isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : (isLocalhost ? 'local' : 'unknown'))
});

// Define the correct Firebase configuration for the project
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Print complete Firebase config for debugging
console.log('[Firebase Debug] Full Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : undefined // Only show part of the API key for security
});

// Enhanced logging for production troubleshooting



// Type check firebaseConfig to ensure it's valid
let configValid = true;
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  configValid = false;
  logError('Firebase', 'Missing required Firebase configuration keys', new Error('Invalid config'), { missingKeys });
  
}

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (value === undefined || value === null || value === '') {
    configValid = false;
    logError('Firebase', `Firebase config key ${key} has invalid value`, new Error('Invalid config value'), { key });
    
  }
}

// Storage for retry mechanism
let initRetryCount = 0;
const MAX_INIT_RETRIES = 3;

// Helper function to initialize Firebase with retries
const initializeFirebaseWithRetry = async () => {
  try {
    if (initRetryCount > 0) {
      console.log(`[Firebase] Retry attempt ${initRetryCount} of ${MAX_INIT_RETRIES}`);
    }
    
    // Initialize the Firebase app if not already initialized
    if (!app) {
      console.log('[Firebase] Initializing Firebase app...');
      app = initializeApp(firebaseConfig);
      console.log('[Firebase] Firebase app initialized successfully');
    }
    
    // Initialize Auth if not already initialized
    if (!auth) {
      console.log('[Firebase] Initializing Firebase auth...');
      auth = getAuth(app);
      console.log('[Firebase] Firebase auth initialized successfully');
    }
    
    // Always ensure auth domain is correctly set
    if (auth) {
      const originalAuthDomain = auth.config.authDomain;
      
      // Use the current hostname as auth domain for production custom domains
      if (!isLocalhost && !isNetlify) {
        auth.config.authDomain = window.location.hostname;
        console.log('[Firebase] Updated auth domain for custom domain:', window.location.hostname);
      }
      
      if (originalAuthDomain !== auth.config.authDomain) {
        console.log('[Firebase] Auth domain updated:', {
          from: originalAuthDomain,
          to: auth.config.authDomain
        });
      }
      
      // Set persistence to LOCAL
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('[Firebase] Successfully set persistence to LOCAL');
        
        // Store deployment info for version tracking
        localStorage.setItem('deployment_platform', isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : 'other'));
        localStorage.setItem('app_version', '2.0.1');
        localStorage.setItem('auth_init_timestamp', Date.now().toString());
        localStorage.setItem('auth_domain', auth.config.authDomain);
        
        return true;
      } catch (persistenceError) {
        console.error('[Firebase] Error setting LOCAL persistence:', persistenceError);
        // Fall back to session persistence as last resort
        try {
          await setPersistence(auth, browserSessionPersistence);
          console.log('[Firebase] Successfully set fallback persistence to SESSION');
          return true;
        } catch (sessionError) {
          console.error('[Firebase] Critical: Failed to set any persistence:', sessionError);
          throw sessionError;
        }
      }
    }
    
    throw new Error('Failed to initialize Firebase auth');
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    throw error;
  }
};

const initFirebase = async () => {
  while (initRetryCount < MAX_INIT_RETRIES) {
    try {
      const success = await initializeFirebaseWithRetry();
      if (success) {
        
        
        // Test auth functionality
        if (auth) {
          try {
            // Use a safe property access to verify auth is working
            const testTenantId = auth.tenantId;
            console.log('Firebase auth verification:', testTenantId ? 'Has tenant ID' : 'No tenant ID');
          } catch (testError) {
            console.warn('Firebase auth verification failed:', testError);
          }
        }
        
        break; // Exit loop on success
      }
      initRetryCount++;
    } catch (error) {
      initRetryCount++;
      if (initRetryCount >= MAX_INIT_RETRIES) {
        
        logError('Firebase', 'Firebase initialization failed after retries', error);
        break;
      }
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * (2 ** initRetryCount), 8000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Start initialization immediately
initFirebase().catch(error => {
  
  // Record the error for diagnostics
  try {
    localStorage.setItem('firebase_init_error', JSON.stringify({
      message: error.message,
      code: error.code,
      time: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to store Firebase init error:', e);
  }
});

// Use a more robust check for auth initialization in all exported functions
const ensureAuth = () => {
  // If auth is not initialized, try to initialize it
  if (!auth && app) {
    console.log('Firebase: Initializing auth from existing app');
    auth = getAuth(app);
  }
  
  // If app is not initialized, initialize it
  if (!app) {
    console.log('Firebase: Initializing new app');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }

  // Verify auth is working
  if (auth) {
    // Test a safe property access
    const testTenantId = auth.tenantId;
    console.log('Firebase auth verification:', testTenantId ? 'Has tenant ID' : 'No tenant ID');
    return auth;
  }

  const error = new Error('Firebase authentication is not initialized');
  error.code = 'auth/service-unavailable';
  error.details = {
    initRetryCount,
    environment: {
      isProduction,
      isNetlify,
      isTryPersonalFinance,
      hostname: window.location.hostname
    }
  };
  throw error;
};

// Updated login function with more robust auth initialization check
export const loginUser = async (email, password) => {
  return timeOperation('Firebase', 'User login', async () => {
    log('Firebase', 'Attempting to login user with email', { email });
    
    
    try {
      // Use the ensureAuth function to verify auth is initialized
      const currentAuth = ensureAuth();
      
      // First set persistence to LOCAL for this specific login attempt
      await setPersistence(currentAuth, browserLocalPersistence);
      log('Firebase', 'Set persistence to LOCAL for login attempt');
      
      // Then proceed with sign in
      
      const userCredential = await signInWithEmailAndPassword(currentAuth, email, password);
      log('Firebase', 'User login successful', { 
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified 
      });
      
      
      // Set/update deployment tracking info
      localStorage.setItem('deployment_platform', isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : 'other'));
      localStorage.setItem('app_version', '2.0.1');
      localStorage.setItem('auth_timestamp', Date.now().toString());
      localStorage.setItem('last_domain', window.location.hostname);
      localStorage.setItem('last_login_success', 'true');
      
      return userCredential.user;
    } catch (error) {
      console.error('[Firebase Debug] Login error:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      // Map Firebase error codes to more user-friendly messages
      let friendlyMessage = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Invalid email format';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Too many failed login attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Network error - please check your connection';
          break;
        case 'auth/invalid-credential':
        case 'auth/invalid-api-key':
        case 'auth/api-key-not-valid':
          friendlyMessage = 'Authentication configuration error. Please contact support.';
          // Add detailed logging for debugging
          console.error('[Firebase Debug] Critical auth error:', {
            code: error.code,
            domain: window.location.origin,
            authDomain: auth.config.authDomain,
            projectId: firebaseConfig.projectId
          });
          break;
        default:
          
          friendlyMessage = `Login failed: ${error.message}`;
          break;
      }
      
      logError('Firebase', 'User login failed', error, { 
        email,
        errorCode: error.code,
        friendlyMessage 
      });
      
      // Enhance the error object with a friendly message
      error.friendlyMessage = friendlyMessage;
      throw error;
    }
  });
};

// Update all other authentication functions similarly
export const registerUser = async (email, password) => {
  return timeOperation('Firebase', 'User registration', async () => {
    log('Firebase', 'Attempting to register user with email', { email });
    
    try {
      const currentAuth = ensureAuth();
      
      // Ensure LOCAL persistence before registration
      await setPersistence(currentAuth, browserLocalPersistence);
      log('Firebase', 'Set persistence to LOCAL for registration');
      
      const userCredential = await createUserWithEmailAndPassword(currentAuth, email, password);
      log('Firebase', 'User registration successful', { uid: userCredential.user.uid });
      
      // Set deployment tracking for new users
      localStorage.setItem('deployment_platform', isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : 'other'));
      localStorage.setItem('app_version', '2.0.1');
      localStorage.setItem('last_domain', window.location.hostname);
      
      return userCredential.user;
    } catch (error) {
      // Map Firebase error codes to more user-friendly messages
      let friendlyMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Invalid email address format';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'Password is too weak';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Network error - please check your connection';
          break;
        default:
          friendlyMessage = `Registration failed: ${error.message}`;
          break;
      }
      
      logError('Firebase', 'User registration failed', error, { 
        email,
        errorCode: error.code,
        friendlyMessage
      });
      
      // Enhance the error object with a friendly message
      error.friendlyMessage = friendlyMessage;
      throw error;
    }
  });
};

export const logoutUser = async () => {
  return timeOperation('Firebase', 'User logout', async () => {
    log('Firebase', 'Attempting to logout user...');
    
    try {
      const currentAuth = ensureAuth();
      await signOut(currentAuth);
      log('Firebase', 'User logout successful');
      
      // Clear any stored authentication tokens or timestamps
      localStorage.removeItem('auth_timestamp');
      localStorage.removeItem('last_login_success');
      // Keep deployment tracking for version checks
    } catch (error) {
      logError('Firebase', 'User logout failed', error);
      throw error;
    }
  });
};

// Improved auth state observer with retry logic
export const onAuthStateChange = (callback) => {
  if (!isProduction) {
    log('Firebase', 'Setting up auth state change listener...');
  }
  
  try {
    // First check if auth is initialized
    if (!auth) {
      
      
      // Set up retry mechanism for auth state listener
      let retryCount = 0;
      const maxRetries = 3;
      const retryInterval = 2000; // 2 seconds
      
      const retryIntervalId = setInterval(() => {
        retryCount++;
        
        
        if (auth) {
          clearInterval(retryIntervalId);
          
          setupAuthStateListener(callback);
        } else if (retryCount >= maxRetries) {
          clearInterval(retryIntervalId);
          
          callback(null); // Notify with null user after all retries fail
        }
      }, retryInterval);
      
      // Return a function to clear the retry interval
      return () => {
        clearInterval(retryIntervalId);
        
      };
    }
    
    return setupAuthStateListener(callback);
  } catch (error) {
    logError('Firebase', 'Error setting up auth state listener', error);
    // Return a no-op unsubscribe
    return () => {};
  }
};

// Helper to set up the actual auth state listener
const setupAuthStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (!isProduction) {
      log('Firebase', 'Auth state changed', { 
        authenticated: !!user,
        uid: user?.uid 
      });
    }
    
    try {
      // Filter user object to avoid circular references
      if (user) {
        const safeUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          // Add last refresh time for token freshness tracking
          lastRefreshTime: Date.now()
        };
        callback(safeUser);
      } else {
        callback(null);
      }
    } catch (callbackError) {
      logError('Firebase', 'Error in auth state change callback', callbackError);
    }
  }, (error) => {
    logError('Firebase', 'Auth state change listener error', error);
    // Make sure we still call the callback with null on error
    try {
      callback(null);
    } catch (cbError) {
      console.error('Error in auth state change callback handler:', cbError);
    }
  });
};

// Log export content
log('Firebase', 'Exporting Firebase auth module', {
  authInitialized: !!auth,
  appInitialized: !!app,
  authFunctionsExported: true
});

// Export module
export { 
  auth, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};

// Added for Google Authentication
const googleProvider = new GoogleAuthProvider();

// Add Google Sign-in function
export const signInWithGoogle = async () => {
  return timeOperation('Firebase', 'Google Sign In', async () => {
    log('Firebase', 'Attempting to sign in with Google');
    
    
    try {
      // Use the ensureAuth function to verify auth is initialized
      const currentAuth = ensureAuth();
      
      // Configure Google Auth Provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Proceed with Google sign in
      
      const userCredential = await signInWithPopup(currentAuth, googleProvider);
      
      log('Firebase', 'Google sign in successful', { 
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified 
      });
      
      
      // Set/update deployment tracking info
      localStorage.setItem('deployment_platform', isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : 'other'));
      
      return userCredential;
    } catch (error) {
      log('Firebase', 'Google sign in failed', { error });
      
      throw error;
    }
  });
}; 