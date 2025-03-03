import React from 'react';
import TransactionsList from './transactions/TransactionsList';
import TransactionAnalytics from './transactions/TransactionAnalytics';

const Transactions: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <TransactionsList />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics</h2>
          <TransactionAnalytics />
        </div>
      </div>
    </div>
  );
};

export default Transactions; 