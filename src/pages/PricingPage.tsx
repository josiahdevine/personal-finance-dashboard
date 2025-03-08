import React from 'react';
import Pricing from '../Components/Pricing';
import { Helmet } from 'react-helmet-async';

const PricingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Personal Finance Dashboard</title>
        <meta name="description" content="Choose the perfect plan for your financial journey" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="py-16">
          <Pricing />
          
          {/* FAQ Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Have a different question? Contact our support team.
              </p>
            </div>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Can I cancel my subscription?
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to your plan until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  How secure is my financial data?
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We use bank-level encryption and security measures to protect your data. We never store your bank credentials and use Plaid for secure bank connections.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Can I switch plans later?
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Yes, you can upgrade or downgrade your plan at any time. The changes will take effect at the start of your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Do you offer refunds?
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We offer a 30-day money-back guarantee for all our plans. If you're not satisfied, contact our support team for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage; 
