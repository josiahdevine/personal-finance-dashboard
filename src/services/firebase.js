import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { log, logError, timeOperation } from '../utils/logger';

// Add logging for environment variables
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

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAbJqW0WWecpkmSM-kezJBovnT501-h44U",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "personal-finance-dashboa-f76f6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "personal-finance-dashboa-f76f6",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "personal-finance-dashboa-f76f6.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "772716663750",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:772716663750:web:f0bf14ba121524684118c7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-6RVP8YZH3S"
};

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
log('Firebase', 'Initializing Firebase app...');
let app;
try {
  if (!configValid) {
    throw new Error('Firebase configuration is invalid. Check the console for details.');
  }
  
  app = initializeApp(firebaseConfig);
  log('Firebase', 'Firebase app initialized successfully', { appName: app.name });
  
  // Verify that app was initialized properly
  if (!app.name) {
    throw new Error('Firebase app was initialized but has no name property');
  }
} catch (error) {
  logError('Firebase', 'Error initializing Firebase app', error, { config: { ...firebaseConfig, apiKey: '***REDACTED***' } });
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Initialize Auth
log('Firebase', 'Initializing Firebase auth...');
let auth;
try {
  if (!app) {
    throw new Error('Cannot initialize auth - Firebase app is not initialized');
  }
  
  auth = getAuth(app);
  
  if (!auth) {
    throw new Error('Firebase auth was initialized but returned null/undefined');
  }
  
  log('Firebase', 'Firebase auth initialized successfully', { authInitialized: !!auth });
  
  // Check that auth has the expected methods
  const requiredAuthMethods = ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'signOut'];
  const missingMethods = requiredAuthMethods.filter(method => typeof auth[method] !== 'function');
  
  if (missingMethods.length > 0) {
    logError('Firebase', 'Firebase auth is missing expected methods', new Error('Auth initialization incomplete'), { missingMethods });
  }
} catch (error) {
  logError('Firebase', 'Error initializing Firebase auth', error);
  throw new Error(`Firebase auth initialization failed: ${error.message}`);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      log('Firebase', 'User login successful', { 
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified 
      });
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

// Auth state observer
export const onAuthStateChange = (callback) => {
  log('Firebase', 'Setting up auth state change listener...');
  
  if (!auth) {
    const error = new Error('Auth service not initialized');
    logError('Firebase', 'Cannot set up auth state listener - auth not initialized', error);
    throw error;
  }
  
  return onAuthStateChanged(auth, (user) => {
    log('Firebase', 'Auth state changed', { 
      authenticated: !!user,
      uid: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified 
    });
    
    try {
      callback(user);
    } catch (callbackError) {
      logError('Firebase', 'Error in auth state change callback', callbackError);
    }
  }, (error) => {
    logError('Firebase', 'Auth state change listener error', error);
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