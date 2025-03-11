import React, { useEffect } from 'react';
import Goals from '../components/Goals';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { log } from '../utils/logger.js';

function GoalsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    log('GoalsPage', 'Financial Goals page component mounted');
    
    // If not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
    }
    
    // Log page view for analytics
    if (typeof window !== 'undefined') {
      log('Analytics', 'Page view', { page: 'goals' });
    }
  }, [currentUser, navigate]);

  return (
    <div className="goals-page">
      <h1 className="sr-only">Financial Goals</h1>
      <Goals />
    </div>
  );
}

export default GoalsPage; 
