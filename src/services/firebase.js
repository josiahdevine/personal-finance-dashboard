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
const isNetlify = !!process.env.NETLIFY || window.location.hostname.includes('netlify.app');

// Add logging for environment variables but only when not in production
if (!isProduction) {
  log('Firebase', 'Initializing Firebase module');
  log('Firebase', 'Firebase Config Available', {
    apiKeyExists: !!process.env.REACT_APP_FIREBASE_API_KEY,
    authDomainExists: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectIdExists: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucketExists: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderIdExists: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appIdExists: !!process.env.REACT_APP_FIREBASE_APP_ID,
    measurementIdExists: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  });
}

// Enhanced logging for environment info
console.log(`[Firebase] Environment: ${process.env.NODE_ENV}`);
console.log(`[Firebase] Netlify: ${isNetlify ? 'Yes' : 'No'}`);
console.log(`[Firebase] Hostname: ${window.location.hostname}`);
console.log(`[Firebase] Origin: ${window.location.origin}`);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAbJqW0WWecpkmSM-kezJBovnT501-h44U",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "personal-finance-dashboa-f76f6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "personal-finance-dashboa-f76f6",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "personal-finance-dashboa-f76f6.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "772716663750",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:772716663750:web:f0bf14ba121524684118c7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-6RVP8YZH3S"
};

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
  
  if (!isProduction) {
    log('Firebase', 'Firebase app initialized successfully', { appName: app.name });
  }
  
  // Initialize Auth
  if (!isProduction) {
    log('Firebase', 'Initializing Firebase auth...');
  }
  
  auth = getAuth(app);
  
  // Set persistence to LOCAL - This will keep the user logged in even after browser restart
  if (auth) {
    // Always force LOCAL persistence for better user experience
    console.log('[Firebase] Setting auth persistence to LOCAL');
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        log('Firebase', 'Auth persistence set to LOCAL successfully');
      })
      .catch((error) => {
        logError('Firebase', 'Failed to set auth persistence', error);
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

  // Check if we're on Netlify
  if (isNetlify) {
    console.log('[Firebase] Running on Netlify, ensuring Firebase Auth configuration is correct');
    
    // When on Netlify, ensure auth domain is correct
    if (auth) {
      // Store original auth domain for reference
      const originalAuthDomain = auth.config.authDomain;
      
      // Force set auth domain to the Firebase project's domain
      auth.config.authDomain = 'personal-finance-dashboa-f76f6.firebaseapp.com';
      
      console.log(`[Firebase] Updated Auth domain from ${originalAuthDomain} to ${auth.config.authDomain}`);
    }
  }
  
  // Check if we're on development for emulator connection
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_AUTH_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('[Firebase] Connected to Firebase Auth Emulator');
    } catch (emulatorError) {
      console.error('[Firebase] Failed to connect to Auth Emulator:', emulatorError);
    }
  }
  
} catch (error) {
  logError('Firebase', 'Error initializing Firebase', error, {
    config: { ...firebaseConfig, apiKey: '***REDACTED***' }
  });
  
  // In production, we'll attempt to create fallback instances
  if (isProduction) {
    try {
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

        // Force auth domain for Netlify
        if (isNetlify) {
          auth.config.authDomain = 'personal-finance-dashboa-f76f6.firebaseapp.com';
          console.log('[Firebase] Fallback mode: Updated auth domain for Netlify');
        }
      }
    } catch (fallbackError) {
      // Critical failure, we can't recover
      console.error('Critical Firebase initialization error:', fallbackError);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      log('Firebase', 'User login successful', { 
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified 
      });
      
      // Store a timestamp in localStorage to help track session
      localStorage.setItem('auth_timestamp', Date.now());
      return userCredential.user;
    } catch (error) {
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
          friendlyMessage = 'Invalid login credentials. The site domain may not be authorized in Firebase.';
          // Add extra console logging for debugging
          console.error('[Firebase Auth Error] Invalid credential error.', {
            domain: window.location.origin,
            authDomain: auth.config.authDomain,
            errorDetails: error
          });
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