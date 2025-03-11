import React, { useState, useEffect } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

export const Transactions: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [_dateFilter, _setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Mock data - replace with real data from your backend
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-02-20',
      description: 'Salary Deposit',
      amount: 3500.00,
      category: 'Income',
      type: 'income',
    },
    {
      id: '2',
      date: '2024-02-19',
      description: 'Netflix Subscription',
      amount: -15.99,
      category: 'Entertainment',
      type: 'expense',
    },
    {
      id: '3',
      date: '2024-02-18',
      description: 'Grocery Shopping',
      amount: -85.47,
      category: 'Food',
      type: 'expense',
    },
  ];

  // Simulated data loading effect
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Transactions
      </h1>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className={`relative flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <input
            type="text"
            placeholder="Search transactions..."
            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex space-x-2">
          <select
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Income">Income</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Food">Food</option>
            {/* Add more categories */}
          </select>
          
          <button
            className={`p-2 rounded-lg ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Transactions list */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : _error ? (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900' : 'bg-red-100'} mb-4`}>
          <p className={isDark ? 'text-red-200' : 'text-red-700'}>{_error}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
          <p className="text-center">No transactions found.</p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};