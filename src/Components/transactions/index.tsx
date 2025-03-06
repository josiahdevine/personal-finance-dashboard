import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  account: string;
}

const TransactionsAnalysis: React.FC = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch('/api/transactions/recent');
        const data = await response.json();
        setRecentTransactions(data);
      } catch (err) {
        setError('Failed to fetch recent transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
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

  const totalIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Total Income</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Total Expenses</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Net Amount</h2>
          </Card.Header>
          <Card.Body>
            <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </Card.Header>
        <Card.Body>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="py-4 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{transaction.account}</span>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}$
                  {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="py-4 text-gray-500 text-center">No recent transactions</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TransactionsAnalysis; 