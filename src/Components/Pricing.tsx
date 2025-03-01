import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  name: string;
  id: string;
  priceId: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    id: 'basic',
    priceId: process.env.REACT_APP_STRIPE_BASIC_PRICE_ID || '',
    price: 9.99,
    description: 'Perfect for getting started with personal finance tracking',
    features: [
      'Basic expense tracking',
      'Monthly budgeting',
      'Basic financial insights',
      'Up to 2 bank accounts',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    id: 'pro',
    priceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || '',
    price: 14.99,
    description: 'Everything you need for advanced financial management',
    features: [
      'Advanced expense tracking',
      'Custom budget categories',
      'AI-powered insights',
      'Unlimited bank accounts',
      'Priority support',
      'Investment tracking',
      'Custom financial goals'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceId: process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 49.99,
    description: 'Custom solutions for businesses and teams',
    features: [
      'All Pro features',
      'Team collaboration',
      'Custom reporting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees'
    ]
  }
];

export const Pricing: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    try {
      if (!user) {
        navigate('/login?redirect=/pricing');
        return;
      }

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ priceId })
      });

      const { sessionId } = await response.json();
      
      // Load Stripe.js
      const stripe = await (window as any).Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      
      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Error:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                tier.highlighted
                  ? 'border-2 border-blue-500 relative'
                  : 'border border-gray-200'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <button
                  onClick={() => handleSubscribe(tier.priceId)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    tier.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {user ? 'Subscribe Now' : 'Sign Up'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <CheckIcon
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing; 