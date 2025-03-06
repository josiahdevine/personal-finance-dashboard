import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  name: string;
  provider: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  nextBillingDate: string;
  category: string;
  status: 'active' | 'cancelled' | 'paused';
  logo?: string;
}

const SubscriptionManager: React.FC = () => {
  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      name: 'Netflix Premium',
      provider: 'Netflix',
      cost: 19.99,
      billingCycle: 'monthly',
      nextBillingDate: '2024-04-01',
      category: 'Entertainment',
      status: 'active',
      logo: '🎬',
    },
    {
      id: '2',
      name: 'Spotify Family',
      provider: 'Spotify',
      cost: 14.99,
      billingCycle: 'monthly',
      nextBillingDate: '2024-04-05',
      category: 'Entertainment',
      status: 'active',
      logo: '🎵',
    },
    {
      id: '3',
      name: 'Amazon Prime',
      provider: 'Amazon',
      cost: 139.00,
      billingCycle: 'yearly',
      nextBillingDate: '2024-12-15',
      category: 'Shopping',
      status: 'active',
      logo: '📦',
    },
    {
      id: '4',
      name: 'Adobe Creative Cloud',
      provider: 'Adobe',
      cost: 52.99,
      billingCycle: 'monthly',
      nextBillingDate: '2024-04-10',
      category: 'Software',
      status: 'active',
      logo: '🎨',
    },
    {
      id: '5',
      name: 'Gym Membership',
      provider: 'Local Gym',
      cost: 45.00,
      billingCycle: 'monthly',
      nextBillingDate: '2024-04-01',
      category: 'Health',
      status: 'active',
      logo: '💪',
    },
  ]);

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billingCycle === 'yearly'
      ? sub.cost / 12
      : sub.billingCycle === 'quarterly'
      ? sub.cost / 3
      : sub.cost;
    return sum + (sub.status === 'active' ? monthlyCost : 0);
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Manager</h1>

        {/* Cost Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Monthly Cost</h2>
            <p className="text-2xl font-bold text-indigo-600">
              ${totalMonthlyCost.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Yearly Cost</h2>
            <p className="text-2xl font-bold text-indigo-600">
              ${totalYearlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map(subscription => (
            <motion.div
              key={subscription.id}
              className="bg-white rounded-lg shadow p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{subscription.logo}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                    <p className="text-sm text-gray-500">{subscription.provider}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost</span>
                  <span className="font-medium text-gray-900">
                    ${subscription.cost.toFixed(2)}/{subscription.billingCycle.slice(0, 2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{subscription.category}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Billing</span>
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    onClick={() => console.log('Edit subscription:', subscription.id)}
                  >
                    Edit
                  </button>
                  {subscription.status === 'active' && (
                    <button
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      onClick={() => console.log('Cancel subscription:', subscription.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Subscription Button */}
        <motion.button
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SubscriptionManager; 