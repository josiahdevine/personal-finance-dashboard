import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  account: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface TransactionFilters {
  startDate: string;
  endDate: string;
  category: string;
  type: 'all' | 'income' | 'expense';
  minAmount: number;
  maxAmount: number;
}

const TransactionsAnalysis: React.FC = () => {
  const [transactions, _setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Salary Deposit',
      amount: 5000.00,
      date: '2024-03-01',
      category: 'Income',
      type: 'income',
      account: 'Main Checking',
      status: 'completed',
    },
    {
      id: '2',
      description: 'Rent Payment',
      amount: -1500.00,
      date: '2024-03-02',
      category: 'Housing',
      type: 'expense',
      account: 'Main Checking',
      status: 'completed',
    },
    {
      id: '3',
      description: 'Grocery Shopping',
      amount: -125.50,
      date: '2024-03-03',
      category: 'Food',
      type: 'expense',
      account: 'Credit Card',
      status: 'completed',
    },
  ]);

  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: '',
    endDate: '',
    category: '',
    type: 'all',
    minAmount: 0,
    maxAmount: Infinity,
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesDate = (!filters.startDate || transaction.date >= filters.startDate) &&
                       (!filters.endDate || transaction.date <= filters.endDate);
    const matchesCategory = !filters.category || transaction.category === filters.category;
    const matchesType = filters.type === 'all' || 
                       (filters.type === 'income' && transaction.amount > 0) ||
                       (filters.type === 'expense' && transaction.amount < 0);
    const matchesAmount = transaction.amount >= filters.minAmount &&
                         (filters.maxAmount === Infinity || transaction.amount <= filters.maxAmount);

    return matchesDate && matchesCategory && matchesType && matchesAmount;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Income</h2>
            <p className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Expenses</h2>
            <p className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Net Amount</h2>
            <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                  className="px-3 py-2 border rounded-md w-full"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                  className="px-3 py-2 border rounded-md w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border rounded-md w-full"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value as 'all' | 'income' | 'expense' })}
                className="px-3 py-2 border rounded-md w-full"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.account}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionsAnalysis;