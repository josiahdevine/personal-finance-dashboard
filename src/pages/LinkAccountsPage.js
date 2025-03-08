import React, { useEffect } from 'react';
import LinkAccounts from '../Components/LinkAccounts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { log } from '../utils/logger';

function LinkAccountsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    log('LinkAccountsPage', 'Link Accounts page component mounted');
    
    // If not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
    }
    
    // Log page view for analytics
    if (typeof window !== 'undefined') {
      log('Analytics', 'Page view', { page: 'link-accounts' });
    }
  }, [currentUser, navigate]);

  return (
    <div className="link-accounts-page">
      <h1 className="sr-only">Link Financial Accounts</h1>
      <LinkAccounts />
    </div>
  );
}

export default LinkAccountsPage; 
