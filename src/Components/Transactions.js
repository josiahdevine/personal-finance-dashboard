import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    accountId: '',
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/plaid/transactions', {
        params: {
          start_date: filter.startDate,
          end_date: filter.endDate
        }
      });
      
      const txns = response.data || [];
      setTransactions(txns);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(txns.flatMap(t => t.category || []))].sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/plaid/accounts');
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchTransactions();
  };

  const resetFilters = () => {
    setFilter({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: '',
      accountId: '',
      minAmount: '',
      maxAmount: '',
      searchTerm: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    if (!category || category.length === 0) return '🛒';
    
    const mainCategory = category[0].toLowerCase();
    
    if (mainCategory.includes('food') || mainCategory.includes('restaurant')) return '🍔';
    if (mainCategory.includes('travel')) return '✈️';
    if (mainCategory.includes('transport')) return '🚗';
    if (mainCategory.includes('shopping')) return '🛍️';
    if (mainCategory.includes('entertainment')) return '🎬';
    if (mainCategory.includes('health')) return '⚕️';
    if (mainCategory.includes('home')) return '🏠';
    if (mainCategory.includes('utilities')) return '💡';
    if (mainCategory.includes('income') || mainCategory.includes('transfer')) return '💰';
    
    return '🛒';
  };

  // Filter transactions based on user settings
  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = !filter.category || 
      (transaction.category && transaction.category.includes(filter.category));
    
    const matchesAccount = !filter.accountId || transaction.account_id === filter.accountId;
    
    const amount = Math.abs(transaction.amount);
    const matchesMinAmount = !filter.minAmount || amount >= parseFloat(filter.minAmount);
    const matchesMaxAmount = !filter.maxAmount || amount <= parseFloat(filter.maxAmount);
    
    const matchesSearch = !filter.searchTerm || 
      transaction.name.toLowerCase().includes(filter.searchTerm.toLowerCase());
    
    return matchesCategory && matchesAccount && matchesMinAmount && 
      matchesMaxAmount && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h2>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={resetFilters}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account
            </label>
            <select
              name="accountId"
              value={filter.accountId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              name="minAmount"
              value={filter.minAmount}
              onChange={handleFilterChange}
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              name="maxAmount"
              value={filter.maxAmount}
              onChange={handleFilterChange}
              placeholder="9999"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex-grow mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="searchTerm"
              value={filter.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search transactions..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="pt-6">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const account = accounts.find(a => a.id === transaction.account_id);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getCategoryIcon(transaction.category)}</span>
                        <span className="text-sm font-medium text-gray-900">{transaction.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category ? transaction.category.join(', ') : 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account ? account.name : 'Unknown Account'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or linking an account to see transactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Transactions; 