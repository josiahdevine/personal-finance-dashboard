import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePlaid } from '../contexts/PlaidContext';
import { useAuth } from '../contexts/AuthContext';
import { log, logError } from '../utils/logger';
import { format } from 'date-fns';
import { currencyFormatter } from '../utils/formatters';
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
import LoadingSpinner from './ui/LoadingSpinner';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_DAYS = 30;

const TransactionsList = () => {
  const { currentUser } = useAuth();
  const { transactions, fetchPlaidTransactions, accounts, loading: plaidLoading } = usePlaid();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [daysToFetch, setDaysToFetch] = useState(DEFAULT_DAYS);
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [transactionType, setTransactionType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - daysToFetch * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch transactions on initial load and when filters change
  const loadTransactions = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      log('TransactionsList', 'Fetching transactions', { 
        daysToFetch, 
        selectedAccountId, 
        dateRange 
      });
      
      const options = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        accountId: selectedAccountId !== 'all' ? selectedAccountId : undefined
      };
      
      await fetchPlaidTransactions(options);
    } catch (err) {
      logError('TransactionsList', 'Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
      toast.error('Could not load your transactions');
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchPlaidTransactions, daysToFetch, selectedAccountId, dateRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await loadTransactions();
      toast.success('Transactions refreshed successfully');
    } catch (err) {
      // Error already handled in loadTransactions
    } finally {
      setIsRefreshing(false);
    }
  };

  // Extract unique categories from transactions
  const categories = useMemo(() => {
    if (!transactions || !transactions.length) return [];
    
    const categorySet = new Set();
    transactions.forEach(transaction => {
      if (transaction.category && transaction.category.length) {
        categorySet.add(transaction.category[0]);
      }
    });
    
    return ['all', ...Array.from(categorySet).sort()];
  }, [transactions]);

  // Filter transactions based on search term and filters
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        transaction.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Account filter
      const matchesAccount = selectedAccountId === 'all' || 
        transaction.account_id === selectedAccountId;
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
        (transaction.category && transaction.category[0] === categoryFilter);
      
      // Transaction type filter (income/expense)
      const isIncome = transaction.amount < 0; // In Plaid, negative is money in, positive is money out
      const matchesType = transactionType === 'all' ||
        (transactionType === 'income' && isIncome) ||
        (transactionType === 'expense' && !isIncome);
      
      return matchesSearch && matchesAccount && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, selectedAccountId, categoryFilter, transactionType]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          // ISO date strings can be compared directly
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'category':
          const catA = a.category && a.category[0] ? a.category[0] : '';
          const catB = b.category && b.category[0] ? b.category[0] : '';
          comparison = catA.localeCompare(catB);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return sortedTransactions.slice(startIndex, startIndex + DEFAULT_PAGE_SIZE);
  }, [sortedTransactions, currentPage]);

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(sortedTransactions.length / DEFAULT_PAGE_SIZE), 
    [sortedTransactions]
  );

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default sort direction when changing fields
    }
  };

  // Get transaction amount class based on value
  const getAmountClass = (amount) => {
    // In Plaid, negative amounts are money in, positive are money out
    return amount < 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  // Format transaction amount for display
  const formatAmount = (amount) => {
    // In Plaid, negative amounts are money in, positive are money out
    // We flip the sign for display purposes
    return currencyFormatter.format(amount * -1);
  };

  // Get account name by ID
  const getAccountName = (accountId) => {
    if (!accounts || !accounts.length) return 'Unknown Account';
    const account = accounts.find(a => a.account_id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  // Handle page navigation
  const changePage = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    // Scroll to top of transactions when changing page
    document.getElementById('transactions-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !transactions.length) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                  />
                  <span className="self-center text-gray-500">to</span>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>
              
              {/* Account Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <TagIcon className="h-4 w-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Transactions</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Transactions List */}
      <div id="transactions-list" className="overflow-x-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions found for the selected filters.</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Transactions
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions match your search or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setSelectedAccountId('all');
                setTransactionType('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Mobile Card View
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedTransactions.map(transaction => (
                  <div key={transaction.transaction_id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {transaction.merchant_name || transaction.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={`font-medium ${getAmountClass(transaction.amount)}`}>
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Account:</span>
                        <span className="text-gray-900 dark:text-white">
                          {getAccountName(transaction.account_id)}
                        </span>
                      </div>
                      {transaction.category && transaction.category.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="text-gray-900 dark:text-white capitalize">
                            {transaction.category.join(' › ')}
                          </span>
                        </div>
                      )}
                      {transaction.pending && (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Pending
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        <span>Date</span>
                        {sortField === 'date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Description</span>
                        {sortField === 'name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        <span>Category</span>
                        {sortField === 'category' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Account
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Amount</span>
                        {sortField === 'amount' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedTransactions.map(transaction => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                        {transaction.pending && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {transaction.merchant_name || transaction.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {transaction.category && transaction.category.length > 0 ? (
                          <span className="capitalize">{transaction.category[0]}</span>
                        ) : (
                          <span className="text-gray-400">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {getAccountName(transaction.account_id)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getAmountClass(transaction.amount)}`}>
                        {formatAmount(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{((currentPage - 1) * DEFAULT_PAGE_SIZE) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * DEFAULT_PAGE_SIZE, filteredTransactions.length)}
                      </span> of{' '}
                      <span className="font-medium">{filteredTransactions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => changePage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">First</span>
                        <ChevronDownIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
                        <ChevronDownIcon className="h-5 w-5 -ml-2 rotate-90" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronDownIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => changePage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                              ${currentPage === pageNumber
                                ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-300'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronDownIcon className="h-5 w-5 -rotate-90" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => changePage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Last</span>
                        <ChevronDownIcon className="h-5 w-5 -rotate-90" aria-hidden="true" />
                        <ChevronDownIcon className="h-5 w-5 -ml-2 -rotate-90" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsList; 