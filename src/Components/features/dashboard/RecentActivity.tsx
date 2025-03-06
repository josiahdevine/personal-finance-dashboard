import React from 'react';
import { Card } from '../../common/Card';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const RecentActivity: React.FC = () => {
  const { transactions, loading } = useTransactions({ limit: 5 });

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <a href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm">
            View All
          </a>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.date)} • {transaction.category[0]}
                  </p>
                </div>
                <span className={`font-medium ${
                  transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No recent transactions
              </p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 