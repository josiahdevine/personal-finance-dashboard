/**
 * Firebase Connection Test Utility
 * 
 * This utility performs direct diagnostic tests on the Firebase connection
 * to help diagnose authentication issues.
 */

import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

/**
 * Tests Firebase connectivity by attempting basic operations
 * and logging detailed results
 */
export const runFirebaseTest = async () => {
  
  
  
  
  // Record test start time for timing
  const startTime = Date.now();
  const results = { success: false, errors: [], tests: [] };
  
  try {
    // 1. Test environment and configuration
    
    results.tests.push({
      name: 'Environment Check',
      status: 'Running'
    });
    
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
    const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
    
    
    
    
    
    
    
    const envStatus = apiKey && authDomain && projectId ? 'Success' : 'Failed';
    results.tests[0].status = envStatus;
    
    if (envStatus === 'Failed') {
      const error = new Error('Missing Firebase configuration');
      results.errors.push({ phase: 'Environment Check', error: error.message });
      throw error;
    }
    
    // 2. Test Firebase initialization
    
    results.tests.push({
      name: 'Firebase Initialization',
      status: 'Running'
    });
    
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    const testApp = initializeApp(firebaseConfig, 'diagnostics-app');
    
    
    if (!testApp) {
      const error = new Error('Failed to initialize Firebase app');
      results.tests[1].status = 'Failed';
      results.errors.push({ phase: 'Firebase Initialization', error: error.message });
      throw error;
    }
    
    results.tests[1].status = 'Success';
    
    // 3. Test Firebase Auth
    
    results.tests.push({
      name: 'Firebase Auth',
      status: 'Running'
    });
    
    const auth = getAuth(testApp);
    
    
    if (!auth) {
      const error = new Error('Failed to initialize Firebase auth');
      results.tests[2].status = 'Failed';
      results.errors.push({ phase: 'Firebase Auth', error: error.message });
      throw error;
    }
    
    // 4. Test anonymous auth
    
    results.tests.push({
      name: 'Anonymous Authentication',
      status: 'Running'
    });
    
    try {
      
      const userCredential = await signInAnonymously(auth);
      
      results.tests[2].status = 'Success';
      results.tests[3].status = 'Success';
    } catch (authError) {
      
      results.tests[3].status = 'Failed';
      results.errors.push({ 
        phase: 'Anonymous Authentication', 
        error: authError.message,
        code: authError.code
      });
      
      // Check if this is an auth domain issue
      if (authError.code === 'auth/invalid-api-key' || 
          authError.code === 'auth/api-key-not-valid' || 
          authError.code === 'auth/unauthorized-domain') {
        
        
        
        
        
      }
    }
    
    // Successful test completion
    const totalTime = Date.now() - startTime;
    results.success = results.errors.length === 0;
    results.totalTime = totalTime;
    
    
    
    
    
    
    if (results.errors.length > 0) {
      
    }
    
    
    return results;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    results.errors.push({ phase: 'Test Suite', error: error.message });
    results.totalTime = totalTime;
    
    
    
    
    
    
    return results;
  }
};

export default runFirebaseTest; 