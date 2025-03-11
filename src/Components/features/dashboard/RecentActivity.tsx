import React, { useState } from 'react';
import Card from "../../common/Card";
import { formatCurrency, formatShortDate } from '../../../utils/formatters';

export const RecentActivity: React.FC = () => {
  const [isLoading] = useState(false);
  
  // Mock transactions data
  const transactions = [
    {
      id: '1',
      description: 'Grocery Store',
      amount: -120.50,
      date: new Date().toISOString(),
      category: ['Food & Dining']
    },
    {
      id: '2',
      description: 'Monthly Salary',
      amount: 3500.00,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      category: ['Income']
    },
    {
      id: '3',
      description: 'Electric Bill',
      amount: -95.20,
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      category: ['Bills & Utilities']
    },
    {
      id: '4',
      description: 'Coffee Shop',
      amount: -4.50,
      date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      category: ['Food & Dining']
    },
    {
      id: '5',
      description: 'Gas Station',
      amount: -45.00,
      date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      category: ['Transportation']
    }
  ];

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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {formatShortDate(transaction.date)} • {transaction.category[0]}
                  </p>
                </div>
                <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : ''}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 