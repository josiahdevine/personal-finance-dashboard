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
  console.log('==========================================');
  console.log('RUNNING FIREBASE CONNECTION DIAGNOSTICS');
  console.log('==========================================');
  
  // Record test start time for timing
  const startTime = Date.now();
  const results = { success: false, errors: [], tests: [] };
  
  try {
    // 1. Test environment and configuration
    console.log('Test 1: Checking environment and configuration');
    results.tests.push({
      name: 'Environment Check',
      status: 'Running'
    });
    
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
    const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
    
    console.log('- Hostname:', hostname);
    console.log('- Origin:', origin);
    console.log('- API Key exists:', !!apiKey);
    console.log('- Auth Domain:', authDomain);
    console.log('- Project ID:', projectId);
    
    const envStatus = apiKey && authDomain && projectId ? 'Success' : 'Failed';
    results.tests[0].status = envStatus;
    
    if (envStatus === 'Failed') {
      const error = new Error('Missing Firebase configuration');
      results.errors.push({ phase: 'Environment Check', error: error.message });
      throw error;
    }
    
    // 2. Test Firebase initialization
    console.log('Test 2: Testing Firebase initialization');
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
    console.log('- Firebase test app initialized:', !!testApp);
    
    if (!testApp) {
      const error = new Error('Failed to initialize Firebase app');
      results.tests[1].status = 'Failed';
      results.errors.push({ phase: 'Firebase Initialization', error: error.message });
      throw error;
    }
    
    results.tests[1].status = 'Success';
    
    // 3. Test Firebase Auth
    console.log('Test 3: Testing Firebase Auth');
    results.tests.push({
      name: 'Firebase Auth',
      status: 'Running'
    });
    
    const auth = getAuth(testApp);
    console.log('- Firebase auth initialized:', !!auth);
    
    if (!auth) {
      const error = new Error('Failed to initialize Firebase auth');
      results.tests[2].status = 'Failed';
      results.errors.push({ phase: 'Firebase Auth', error: error.message });
      throw error;
    }
    
    // 4. Test anonymous auth
    console.log('Test 4: Testing anonymous authentication');
    results.tests.push({
      name: 'Anonymous Authentication',
      status: 'Running'
    });
    
    try {
      console.log('- Attempting anonymous sign in...');
      const userCredential = await signInAnonymously(auth);
      console.log('- Anonymous sign in successful, user ID:', userCredential.user.uid);
      results.tests[2].status = 'Success';
      results.tests[3].status = 'Success';
    } catch (authError) {
      console.error('- Anonymous sign in failed:', authError.code, authError.message);
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
        console.error('CRITICAL ERROR: This appears to be an issue with Firebase configuration!');
        console.error('Please verify:');
        console.error(`1. "${hostname}" is added to authorized domains in Firebase Console`);
        console.error('2. The API key is correct');
        console.error('3. The project ID is correct');
      }
    }
    
    // Successful test completion
    const totalTime = Date.now() - startTime;
    results.success = results.errors.length === 0;
    results.totalTime = totalTime;
    
    console.log('==========================================');
    console.log(`Firebase tests completed in ${totalTime}ms`);
    console.log(`Overall status: ${results.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('Test results:', results.tests);
    
    if (results.errors.length > 0) {
      console.error('Errors encountered:', results.errors);
    }
    console.log('==========================================');
    
    return results;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Test suite failed:', error);
    results.errors.push({ phase: 'Test Suite', error: error.message });
    results.totalTime = totalTime;
    
    console.log('==========================================');
    console.log(`Firebase tests FAILED in ${totalTime}ms`);
    console.error('Critical error:', error);
    console.log('==========================================');
    
    return results;
  }
};

export default runFirebaseTest; 