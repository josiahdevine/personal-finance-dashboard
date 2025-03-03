import { auth } from './firebase';

/**
 * Get the authentication token for the current user
 * @returns {Promise<string|null>} The JWT token or null if no user is logged in
 */
export const getToken = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    // Force token refresh to ensure we have the latest token
    return await user.getIdToken(true);
  } catch (error) {
    
    return null;
  }
}; 