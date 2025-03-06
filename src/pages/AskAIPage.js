import React, { useEffect } from 'react';
import AskAI from '../components/AskAI';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { log } from '../utils/logger';

function AskAIPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    log('AskAIPage', 'Ask AI page component mounted');
    
    // If not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
    }
    
    // Log page view for analytics
    if (typeof window !== 'undefined') {
      log('Analytics', 'Page view', { page: 'ask-ai' });
    }
  }, [currentUser, navigate]);

  return (
    <div className="ask-ai-page">
      <h1 className="sr-only">Financial AI Assistant</h1>
      <AskAI />
    </div>
  );
}

export default AskAIPage; 