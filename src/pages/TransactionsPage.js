import React, { useEffect } from 'react';
import Transactions from '../components/Transactions';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { log } from '../utils/logger.js';

function TransactionsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    log('TransactionsPage', 'Transactions page component mounted');
    
    // If not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
    }
    
    // Log page view for analytics
    if (typeof window !== 'undefined') {
      log('Analytics', 'Page view', { page: 'transactions' });
    }
  }, [currentUser, navigate]);

  return (
    <div className="transactions-page">
      <h1 className="sr-only">Transaction History</h1>
      <Transactions />
    </div>
  );
}

export default TransactionsPage; 
