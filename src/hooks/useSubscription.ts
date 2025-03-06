import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService } from '../services/SubscriptionService';

interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'none';
  plan: string;
  currentPeriodEnd: string;
}

export const useSubscription = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!auth.state.user) {
        setSubscriptionStatus(null);
        setLoading(false);
        return;
      }

      try {
        const status = await SubscriptionService.getSubscriptionStatus(auth.state.user.id);
        setSubscriptionStatus(status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [auth.state.user]);

  const redirectToCustomerPortal = async () => {
    if (!auth.state.user) return;

    try {
      const response = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.state.user.id}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    loading,
    error,
    subscriptionStatus,
    redirectToCustomerPortal
  };
}; 