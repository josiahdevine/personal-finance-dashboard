import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBillingDate: string;
  category: string;
  provider: string;
  status: 'active' | 'canceled' | 'paused';
  autoRenew: boolean;
}

const SubscriptionsAnalysis: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/subscriptions');
        const data = await response.json();
        setSubscriptions(data);
      } catch (err) {
        setError('Failed to fetch subscriptions');
        console.error('Error fetching subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  const totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
    let monthlyAmount = sub.amount;
    switch (sub.billingCycle) {
      case 'yearly':
        monthlyAmount /= 12;
        break;
      case 'weekly':
        monthlyAmount *= 4;
        break;
    }
    return total + monthlyAmount;
  }, 0);

  const subscriptionsByCategory = activeSubscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const upcomingRenewals = activeSubscriptions
    .filter(sub => {
      const renewalDate = new Date(sub.nextBillingDate);
      const today = new Date();
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilRenewal <= 30;
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Spend</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              ${totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 mt-2">Total monthly subscriptions</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              {activeSubscriptions.length}
            </div>
            <p className="text-gray-500 mt-2">
              of {subscriptions.length} total subscriptions
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Auto-Renewing</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              {activeSubscriptions.filter(sub => sub.autoRenew).length}
            </div>
            <p className="text-gray-500 mt-2">
              subscriptions set to auto-renew
            </p>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Subscriptions by Category</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(subscriptionsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h2>
          </Card.Header>
          <Card.Body>
            <div className="divide-y divide-gray-200">
              {upcomingRenewals.map(subscription => {
                const renewalDate = new Date(subscription.nextBillingDate);
                const today = new Date();
                const daysUntilRenewal = Math.ceil(
                  (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={subscription.id} className="py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{subscription.name}</h3>
                      <p className="text-sm text-gray-500">
                        {subscription.provider} - {subscription.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        Renews in {daysUntilRenewal} days
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${subscription.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.billingCycle}
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingRenewals.length === 0 && (
                <p className="py-4 text-gray-500 text-center">No upcoming renewals in the next 30 days</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionsAnalysis; 