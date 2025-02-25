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
  connectAuthEmulator
} from 'firebase/auth';
import { log, logError, timeOperation } from '../utils/logger';

// Production mode should be less verbose
const isProduction = process.env.NODE_ENV === 'production';
// Simplify platform detection - focus only on Netlify vs custom domain
const isNetlify = window.location.hostname.includes('netlify.app');
const isTryPersonalFinance = window.location.hostname.includes('trypersonalfinance.com');

// Add detailed logging for Firebase configuration troubleshooting
console.log('[Firebase Debug] Environment Info:', {
  isProduction,
  isNetlify,
  isTryPersonalFinance,
  hostname: window.location.hostname,
  origin: window.location.origin,
  env: process.env.NODE_ENV,
  apiKeyExists: !!process.env.REACT_APP_FIREBASE_API_KEY,
  apiKeyLength: process.env.REACT_APP_FIREBASE_API_KEY ? process.env.REACT_APP_FIREBASE_API_KEY.length : 0,
  currentDeployment: isNetlify ? 'netlify' : (isTryPersonalFinance ? 'custom-domain' : 'local')
});

// Define the correct Firebase configuration for the project
// Verified against Firebase console values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAbJqW0WWecpkmSM-kezJBovnT501-h44U",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "personal-finance-dashboa-f76f6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "personal-finance-dashboa-f76f6",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "personal-finance-dashboa-f76f6.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "772716663750",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:772716663750:web:f0bf14ba121524684118c7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-6RVP8YZH3S"
};

// Print complete Firebase config for debugging
console.log('[Firebase Debug] Full Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : undefined // Only show part of the API key for security
});

// Enhanced logging for production troubleshooting
console.log(`[Firebase Config] Using Auth Domain: ${firebaseConfig.authDomain}`);
console.log(`[Firebase Config] Current Origin: ${window.location.origin}`);

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

// Initialize Firebase
let app;
let auth;

try {
  // Less verbose logging in production
  if (!isProduction) {
    log('Firebase', 'Initializing Firebase app...');
  }
  
  app = initializeApp(firebaseConfig);
  
  console.log('[Firebase Debug] Firebase app initialized:', !!app);
  
  // Initialize Auth
  if (!isProduction) {
    log('Firebase', 'Initializing Firebase auth...');
  }
  
  auth = getAuth(app);
  console.log('[Firebase Debug] Firebase auth initialized:', !!auth);
  
  // Set persistence to LOCAL - This will keep the user logged in even after browser restart
  if (auth) {
    // Always force LOCAL persistence for better user experience
    console.log('[Firebase] Setting auth persistence to LOCAL');
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        log('Firebase', 'Auth persistence set to LOCAL successfully');
        console.log('[Firebase Debug] Persistence set to LOCAL successfully');
        
        // Store deployment info for version tracking
        localStorage.setItem('deployment_platform', 'netlify');
        localStorage.setItem('app_version', '2.0.0'); // Version tracking for auth migrations
      })
      .catch((error) => {
        logError('Firebase', 'Failed to set auth persistence', error);
        console.error('[Firebase Debug] Failed to set persistence:', error.message);
        // Fall back to session persistence if local fails
        console.log('[Firebase] Falling back to SESSION persistence');
        setPersistence(auth, browserSessionPersistence).catch(e => {
          console.error('[Firebase] Failed to set SESSION persistence', e);
        });
      });
  }
  
  if (!isProduction) {
    log('Firebase', 'Firebase auth initialized successfully');
  }

  // When on Netlify or custom domain, always use the correct authDomain from Firebase
  if (auth) {
    // CRITICAL: Always ensure auth domain is set correctly for all environments
    const originalAuthDomain = auth.config.authDomain;
    
    // IMPORTANT - ALWAYS use the Firebase project's auth domain
    auth.config.authDomain = 'personal-finance-dashboa-f76f6.firebaseapp.com';
    
    console.log(`[Firebase] Updated Auth domain from ${originalAuthDomain} to ${auth.config.authDomain}`);
    
    // Track the current domain for migration notices
    localStorage.setItem('last_domain', window.location.hostname);
  }
  
  // Additional test for CORS and auth domain issues
  console.log('[Firebase Debug] Testing Firebase auth availability...');
  // Use the tenantId property in a valid expression to avoid ESLint warnings
  const testTenantId = auth.tenantId; 
  console.log('[Firebase Debug] Auth tenant ID access test:', testTenantId === null ? 'Success' : 'Has Tenant ID');
  
} catch (error) {
  console.error('[Firebase Debug] Error initializing Firebase:', error.message);
  logError('Firebase', 'Error initializing Firebase', error, {
    config: { ...firebaseConfig, apiKey: '***REDACTED***' }
  });
  
  // In production, we'll attempt to create fallback instances
  if (isProduction) {
    try {
      console.log('[Firebase Debug] Attempting fallback initialization...');
      // Last attempt to initialize Firebase with default values
      if (!app) {
        app = initializeApp(firebaseConfig);
      }
      if (!auth) {
        auth = getAuth(app);

        // Force persistence for fallback initialization
        setPersistence(auth, browserLocalPersistence).catch(e => {
          console.error('[Firebase] Failed to set persistence in fallback mode:', e);
        });

        // Always force the correct auth domain
        auth.config.authDomain = 'personal-finance-dashboa-f76f6.firebaseapp.com';
        console.log('[Firebase] Fallback mode: Updated auth domain');
      }
      console.log('[Firebase Debug] Fallback initialization completed. Auth available:', !!auth);
    } catch (fallbackError) {
      // Critical failure, we can't recover
      console.error('[Firebase Debug] Critical Firebase initialization error:', fallbackError.message);
    }
  }
}

// Authentication functions with better error handling and timing
export const registerUser = async (email, password) => {
  return timeOperation('Firebase', 'User registration', async () => {
    log('Firebase', 'Attempting to register user with email', { email });
    
    if (!auth) {
      const error = new Error('Auth service not initialized');
      logError('Firebase', 'Registration failed - auth not initialized', error);
      throw error;
    }
    
    try {
      // Ensure LOCAL persistence before registration
      await setPersistence(auth, browserLocalPersistence);
      log('Firebase', 'Set persistence to LOCAL for registration');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      log('Firebase', 'User registration successful', { uid: userCredential.user.uid });
      
      // Set deployment tracking for new users
      localStorage.setItem('deployment_platform', 'netlify');
      localStorage.setItem('app_version', '2.0.0');
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

export const loginUser = async (email, password) => {
  return timeOperation('Firebase', 'User login', async () => {
    log('Firebase', 'Attempting to login user with email', { email });
    console.log('[Firebase Debug] Login attempt:', { email, authInitialized: !!auth });
    
    if (!auth) {
      const error = new Error('Auth service not initialized');
      logError('Firebase', 'Login failed - auth not initialized', error);
      throw error;
    }
    
    try {
      // First set persistence to LOCAL for this specific login attempt
      await setPersistence(auth, browserLocalPersistence);
      log('Firebase', 'Set persistence to LOCAL for login attempt');
      
      // Then proceed with sign in
      console.log('[Firebase Debug] Attempting signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      log('Firebase', 'User login successful', { 
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified 
      });
      console.log('[Firebase Debug] Login successful');
      
      // Set/update deployment tracking info
      localStorage.setItem('deployment_platform', 'netlify');
      localStorage.setItem('app_version', '2.0.0');
      localStorage.setItem('auth_timestamp', Date.now().toString());
      localStorage.setItem('last_domain', window.location.hostname);
      
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
          console.error('[Firebase Debug] Unhandled error code:', error.code);
          friendlyMessage = `Login failed: ${error.message}`;
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

export const logoutUser = async () => {
  return timeOperation('Firebase', 'User logout', async () => {
    log('Firebase', 'Attempting to logout user...');
    
    if (!auth) {
      const error = new Error('Auth service not initialized');
      logError('Firebase', 'Logout failed - auth not initialized', error);
      throw error;
    }
    
    try {
      await signOut(auth);
      log('Firebase', 'User logout successful');
      
      // Clear any stored authentication tokens or timestamps
      localStorage.removeItem('auth_timestamp');
      // Keep deployment tracking for version checks
    } catch (error) {
      logError('Firebase', 'User logout failed', error);
      throw error;
    }
  });
};

// Auth state observer with better error handling for production
export const onAuthStateChange = (callback) => {
  if (!isProduction) {
    log('Firebase', 'Setting up auth state change listener...');
  }
  
  if (!auth) {
    const error = new Error('Auth service not initialized');
    logError('Firebase', 'Cannot set up auth state listener', error);
    // Don't throw in production, return a no-op unsubscribe
    return () => {};
  }
  
  try {
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
            emailVerified: user.emailVerified
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
    });
  } catch (error) {
    logError('Firebase', 'Error setting up auth state listener', error);
    // Don't throw in production, return a no-op unsubscribe
    return () => {};
  }
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