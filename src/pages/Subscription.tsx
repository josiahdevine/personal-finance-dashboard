import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { initializeStripe } from '../utils/stripeUtils';
import { motion } from 'framer-motion';
import { Button } from '../Components/ui';

// Initialize Stripe
const stripePromise = initializeStripe();

const Subscription: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch current subscription status
        const response = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium">Error Loading Subscription</h3>
            <p className="mt-2 text-sm">{error}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="px-6 py-8 sm:p-10">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                Your Subscription
              </h2>

              {subscription ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Current Plan
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">
                          {subscription.status === 'active' ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Plan</p>
                        <p className="font-medium text-gray-900">
                          {subscription.plan || 'No active plan'}
                        </p>
                      </div>
                      {subscription.currentPeriodEnd && (
                        <div>
                          <p className="text-sm text-gray-500">Renews On</p>
                          <p className="font-medium text-gray-900">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/pricing')}
                    >
                      Change Plan
                    </Button>
                    {subscription.status === 'active' && (
                      <Button
                        variant="outline"
                        onClick={() => navigate('/billing')}
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    You don't have an active subscription.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/pricing')}
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Elements>
  );
};

export default Subscription; 