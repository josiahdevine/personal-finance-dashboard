import { getAuth, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

/**
 * Force logout all users
 * Used to ensure clean authentication state during platform migrations
 */
export const forceLogout = () => {
  console.log('Forcing user logout for platform migration');
  
  try {
    // Clear Firebase auth state
    const auth = getAuth();
    if (auth && auth.currentUser) {
      signOut(auth);
    }
    
    // Clear localStorage items related to auth
    localStorage.removeItem('auth_timestamp');
    localStorage.removeItem('firebase:authUser');
    
    // Keep deployment info for tracking
    localStorage.setItem('deployment_platform', 'netlify');
    localStorage.setItem('app_version', '2.0.0');
    localStorage.setItem('last_domain', window.location.hostname);
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during force logout:', error);
    // If logout fails, still try to redirect
    window.location.href = '/login';
  }
};

/**
 * Check if the user needs to be migrated from a previous deployment
 * @returns {boolean} True if migration is needed
 */
export const checkNeedsMigration = () => {
  const lastDomain = localStorage.getItem('last_domain');
  const deploymentPlatform = localStorage.getItem('deployment_platform');
  const currentDomain = window.location.hostname;
  
  // Check if we're on a different platform now
  const platformChanged = deploymentPlatform !== 'netlify';
  
  // Check if domain changed
  const domainChanged = lastDomain && lastDomain !== currentDomain;
  
  return platformChanged || domainChanged;
};

/**
 * Show a migration notice to users coming from the previous deployment
 */
export const showMigrationNotice = () => {
  const lastDomain = localStorage.getItem('last_domain');
  const currentDomain = window.location.hostname;
  
  if (lastDomain && lastDomain !== currentDomain) {
    toast.info(
      "We've upgraded our platform! If you experience any issues, please try logging out and back in.",
      {
        position: "top-center",
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      }
    );
  }
  
  // Update the last domain
  localStorage.setItem('last_domain', window.location.hostname);
};

/**
 * Complete auth platform migration
 * To be called after successful login/registration on the new platform
 */
export const completeAuthMigration = () => {
  localStorage.setItem('deployment_platform', 'netlify');
  localStorage.setItem('app_version', '2.0.0');
  localStorage.setItem('last_domain', window.location.hostname);
  
  // Add any other migration tasks here
};

export default {
  forceLogout,
  checkNeedsMigration,
  showMigrationNotice,
  completeAuthMigration
}; 