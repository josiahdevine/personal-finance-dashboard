import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { log } from '../utils/logger';

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    log('DashboardPage', 'Dashboard page component mounted');
    
    // If not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
    }
    
    // Log page view for analytics
    if (typeof window !== 'undefined') {
      log('Analytics', 'Page view', { page: 'dashboard' });
    }
  }, [currentUser, navigate]);

  return (
    <div className="dashboard-page">
      <h1 className="sr-only">Personal Finance Dashboard</h1>
      <Dashboard />
    </div>
  );
}

export default DashboardPage; 
