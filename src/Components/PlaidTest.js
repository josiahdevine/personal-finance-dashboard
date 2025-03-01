import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../contexts/AuthContext';
import { usePlaid } from '../contexts/PlaidContext';

const PlaidTest = () => {
  const { currentUser } = useAuth();
  const { createLinkToken, plaidConfig } = usePlaid();
  const [connectedAccount, setConnectedAccount] = useState(null);

  useEffect(() => {
    if (currentUser) {
      createLinkToken();
    }
  }, [currentUser, createLinkToken]);

  const { open, ready } = usePlaidLink(plaidConfig || {});

  const handleSuccess = (publicToken, metadata) => {
    console.log('Success!', { publicToken, metadata });
    setConnectedAccount(metadata.institution.name);
  };

  const handleExit = (error, metadata) => {
    console.log('Exit!', { error, metadata });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Plaid Link Test
        </h1>
        
        {currentUser ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Click the button below to connect your bank account using Plaid
            </p>
            
            <button
              onClick={() => ready && open()}
              disabled={!ready}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 rounded-md"
            >
              Connect Your Bank
            </button>

            {connectedAccount && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <p className="text-green-700">
                  Successfully connected to {connectedAccount}!
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">
            Please log in to connect your bank account.
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaidTest; 