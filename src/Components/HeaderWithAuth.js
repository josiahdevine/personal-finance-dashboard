import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { log } from '../utils/logger';

/**
 * HeaderWithAuth component conditionally renders the Header based on authentication state
 * It also logs rendering events and prevents flashing content during loading
 */
function HeaderWithAuth() {
  // Pull auth data outside of any conditionals to follow React Hooks rules
  const { currentUser, loading } = useAuth();
  
  try {
    log('HeaderWithAuth', 'Rendering HeaderWithAuth component');
    
    log('HeaderWithAuth', 'Authentication state', { 
      isAuthenticated: !!currentUser,
      isLoading: loading
    });
    
    // Don't render anything while loading to avoid flashing content
    if (loading) return null;
    
    // Only render the Header for authenticated users
    return currentUser ? <Header /> : null;
  } catch (error) {
    console.error('Error in HeaderWithAuth:', error);
    // Return null if an error occurs instead of crashing
    return null;
  }
}

export default HeaderWithAuth; 