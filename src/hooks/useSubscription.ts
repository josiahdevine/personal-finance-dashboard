import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

interface SubscriptionStatus {
  status: 'active' | 'no_subscription';
  subscription?: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/.netlify/functions/subscription-status', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }

        const data = await response.json();
        setSubscriptionStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const redirectToCustomerPortal = async () => {
    if (!user) return;

    try {
      const response = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
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