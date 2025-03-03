import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePlaid } from '../../contexts/PlaidContext';
import { useAuth } from '../../contexts/AuthContext';
import { log, logError } from '../../utils/logger';
import { format } from 'date-fns';
import { currencyFormatter } from '../../utils/formatters';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';

const TransactionsList = () => {
  const { currentUser } = useAuth();
  const { getTransactions } = usePlaid();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      setTransactions(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      logError('TransactionsList', 'Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  }, [getTransactions]);

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser, fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || transaction.category === filters.category;
      const matchesAmount = (!filters.minAmount || transaction.amount >= parseFloat(filters.minAmount)) &&
                          (!filters.maxAmount || transaction.amount <= parseFloat(filters.maxAmount));
      const matchesDate = (!filters.startDate || new Date(transaction.date) >= new Date(filters.startDate)) &&
                         (!filters.endDate || new Date(transaction.date) <= new Date(filters.endDate));
      
      return matchesSearch && matchesCategory && matchesAmount && matchesDate;
    });
  }, [transactions, filters]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchTransactions} onKeyDown={fetchTransactions} role="button" tabIndex={0}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={() => setFilters({
              search: '',
              startDate: '',
              endDate: '',
              category: '',
              minAmount: '',
              maxAmount: ''
            })}
            onKeyDown={() => setFilters({
              search: '',
              startDate: '',
              endDate: '',
              category: '',
              minAmount: '',
              maxAmount: ''
            })}
            role="button"
            tabIndex={0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      {currencyFormatter.format(Math.abs(transaction.amount))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList; 