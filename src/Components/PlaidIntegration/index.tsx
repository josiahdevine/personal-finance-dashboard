import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidIntegrationProps {
  onClose: () => void;
}

const PlaidIntegration: React.FC<PlaidIntegrationProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual token from your backend
  const { open, ready } = usePlaidLink({
    token: 'your-link-token',
    onSuccess: (public_token, metadata) => {
      setIsLoading(false);
      console.log('Success:', public_token, metadata);
      // TODO: Send public_token to your backend to exchange for access_token
      onClose();
    },
    onExit: () => {
      setIsLoading(false);
      // Handle user exiting Plaid Link
    },
  });

  const handlePlaidOpen = () => {
    setIsLoading(true);
    open();
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Connect Your Accounts
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Securely connect your accounts using Plaid's trusted platform.
              We support over 11,000 financial institutions.
            </p>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handlePlaidOpen}
                disabled={!ready || isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Connect Bank Account'
                )}
              </button>

              <button
                onClick={() => {/* TODO: Implement manual account addition */}}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out"
              >
                Add Account Manually
              </button>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Supported Features
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Bank Accounts',
                  'Credit Cards',
                  'Investments',
                  'Loans',
                  'Transactions',
                  'Balances',
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlaidIntegration; 