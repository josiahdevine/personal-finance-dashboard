/**
 * Deployment Debug Utility
 * 
 * This utility helps debug issues with deployment environments.
 * It logs important information about the current environment and configuration.
 */

const initDeploymentDebug = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;

  console.log('====== DEPLOYMENT DEBUG INFORMATION ======');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Hostname: ${window.location.hostname}`);
  console.log(`Origin: ${window.location.origin}`);
  
  // Check important environment variables
  console.log('\n=== Environment Variables ===');
  console.log(`REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'Not set'}`);
  console.log(`REACT_APP_DOMAIN: ${process.env.REACT_APP_DOMAIN || 'Not set'}`);
  console.log(`REACT_APP_DEPLOY_PLATFORM: ${process.env.REACT_APP_DEPLOY_PLATFORM || 'Not set'}`);
  
  // Check Firebase configuration
  console.log('\n=== Firebase Configuration ===');
  console.log(`Firebase API Key exists: ${Boolean(process.env.REACT_APP_FIREBASE_API_KEY)}`);
  console.log(`Firebase Auth Domain: ${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Not set'}`);
  console.log(`Firebase Project ID: ${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not set'}`);
  
  // Check if the current domain is likely to be in Firebase authorized domains
  const currentDomain = window.location.hostname;
  const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '';
  const isAuthDomainSetup = Boolean(authDomain);
  const isNetlifyDomain = currentDomain.includes('netlify.app');
  const isCustomDomain = currentDomain.includes('trypersonalfinance.com');
  
  console.log('\n=== Domain Authorization Check ===');
  console.log(`Current domain: ${currentDomain}`);
  console.log(`Firebase Auth Domain is set up: ${isAuthDomainSetup ? 'Yes' : 'No'}`);
  console.log(`Using Netlify domain: ${isNetlifyDomain ? 'Yes' : 'No'}`);
  console.log(`Using custom domain: ${isCustomDomain ? 'Yes' : 'No'}`);
  
  // Check for common Firebase authentication issues
  console.log('\n=== Authentication Setup Check ===');
  if (isCustomDomain) {
    console.log('IMPORTANT: Ensure trypersonalfinance.com is added to Firebase authorized domains');
    console.log('Instructions:');
    console.log('1. Go to Firebase console: https://console.firebase.google.com/');
    console.log('2. Select your project: personal-finance-dashboa-f76f6');
    console.log('3. Go to Authentication > Settings > Authorized domains');
    console.log('4. Add trypersonalfinance.com if not already listed');
  }
  
  console.log('====== END DEBUG INFORMATION ======');
};

export default initDeploymentDebug; 