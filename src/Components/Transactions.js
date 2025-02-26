import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { HiOutlineExclamationCircle, HiOutlineRefresh, HiOutlineDocumentDownload, HiOutlineCalendar, HiOutlineChartPie } from 'react-icons/hi';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Color palette for categories
const categoryColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#FF595E'
];

const MonthlyBreakdown = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState('chart'); // 'chart' or 'table'
  
  // Generate array of month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate array of available years from transactions
  const years = [...new Set(transactions.map(t => 
    new Date(t.date).getFullYear()
  ))].sort((a, b) => b - a); // Sort descending
  
  // If no years are available, use current year
  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }
  
  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });
  
  // Group transactions by category
  const categorySums = {};
  filteredTransactions.forEach(t => {
    // Use primary category or "Uncategorized"
    const category = t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized';
    // Only include expenses (negative amounts)
    if (t.amount < 0) {
      categorySums[category] = (categorySums[category] || 0) + Math.abs(t.amount);
    }
  });
  
  // Prepare chart data
  const chartData = {
    labels: Object.keys(categorySums),
    datasets: [{
      data: Object.values(categorySums),
      backgroundColor: Object.keys(categorySums).map((_, i) => 
        categoryColors[i % categoryColors.length]
      ),
      borderWidth: 1
    }]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: `Expenses by Category: ${months[selectedMonth]} ${selectedYear}`
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `$${value.toFixed(2)}`;
          }
        }
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between mb-4">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Monthly Breakdown</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <select 
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mr-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, i) => (
                <option key={i} value={i}>{month}</option>
              ))}
            </select>
            
            <select
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded ${viewType === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewType('chart')}
            >
              <HiOutlineChartPie className="inline mr-1" />
              Chart
            </button>
            <button 
              className={`px-3 py-1 rounded ${viewType === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewType('table')}
            >
              <HiOutlineCalendar className="inline mr-1" />
              Table
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Category Chart */}
        <div className="w-full h-full flex justify-center items-center">
          {viewType === 'chart' ? (
            Object.keys(categorySums).length > 0 ? (
              <div className="w-full" style={{ maxHeight: '400px' }}>
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No expense data available for this period
              </div>
            )
          ) : (
            <div className="overflow-auto max-h-96 w-full">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Category</th>
                    <th className="py-2 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(categorySums).length > 0 ? (
                    Object.entries(categorySums)
                      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
                      .map(([category, amount], i) => (
                        <tr key={category} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4">
                            <span 
                              className="inline-block w-3 h-3 rounded-full mr-2" 
                              style={{backgroundColor: categoryColors[i % categoryColors.length]}}
                            ></span>
                            {category}
                          </td>
                          <td className="py-2 px-4 text-right">${amount.toFixed(2)}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-4 text-center text-gray-500">
                        No expense data available for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Right side: Monthly comparison */}
        <div className="w-full" style={{ height: '400px' }}>
          <MonthlyComparison 
            transactions={transactions} 
            selectedYear={selectedYear}
          />
        </div>
      </div>
    </div>
  );
};

const MonthlyComparison = ({ transactions, selectedYear }) => {
  // Group transactions by month
  const monthlySums = Array(12).fill(0);
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    if (date.getFullYear() === selectedYear && t.amount < 0) {
      monthlySums[date.getMonth()] += Math.abs(t.amount);
    }
  });
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const chartData = {
    labels: months,
    datasets: [{
      label: 'Monthly Expenses',
      data: monthlySums,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Monthly Expenses Comparison (${selectedYear})`
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `$${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value}`
        }
      }
    }
  };
  
  return (
    <Bar data={chartData} options={chartOptions} />
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Move these functions before the useEffect and wrap with useCallback
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching transactions with filter:', filter);
      
      const response = await api.get('/api/plaid/transactions', {
        params: {
          start_date: filter.startDate,
          end_date: filter.endDate
        }
      });
      
      const txns = response.data || [];
      console.log(`Fetched ${txns.length} transactions`);
      setTransactions(txns);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(txns.flatMap(t => t.category || []))].sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions data. Using mock data instead.');
      
      // Provide a more informative toast message
      toast.info('Using sample transaction data for demonstration purposes.', {
        autoClose: 5000,
        position: "top-right"
      });
      
      // Use mock data in development - for testing UI when API isn't available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock transaction data for development');
        const mockTransactions = generateMockTransactions();
        setTransactions(mockTransactions);
        
        // Extract unique mock categories
        const uniqueMockCategories = [...new Set(mockTransactions.flatMap(t => t.category || []))].sort();
        setCategories(uniqueMockCategories);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get('/api/plaid/accounts');
      console.log('Fetched accounts:', response.data);
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Use mock accounts data for development
      if (process.env.NODE_ENV === 'development') {
        const mockAccounts = [
          { account_id: 'mock-checking', name: 'Mock Checking', type: 'depository', subtype: 'checking', balances: { current: 2500 } },
          { account_id: 'mock-savings', name: 'Mock Savings', type: 'depository', subtype: 'savings', balances: { current: 10000 } },
          { account_id: 'mock-credit', name: 'Mock Credit Card', type: 'credit', subtype: 'credit card', balances: { current: -1500 } }
        ];
        setAccounts(mockAccounts);
      }
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [fetchTransactions, fetchAccounts]);

  // Helper function to generate mock transactions for development
  const generateMockTransactions = () => {
    const mockCategories = [
      ['Food and Drink', 'Groceries'],
      ['Food and Drink', 'Restaurants'],
      ['Transportation', 'Gas'],
      ['Transportation', 'Public Transit'],
      ['Shopping', 'Clothing'],
      ['Shopping', 'Electronics'],
      ['Bills', 'Utilities'],
      ['Bills', 'Rent'],
      ['Entertainment', 'Movies'],
      ['Entertainment', 'Subscription']
    ];
    
    const mockVendors = [
      'Grocery Store', 'Local Restaurant', 'Gas Station', 'Transit Authority', 
      'Clothing Shop', 'Electronics Store', 'Utility Company', 'Property Management', 
      'Cinema', 'Netflix', 'Amazon', 'Coffee Shop', 'Pharmacy', 'Gym'
    ];
    
    // Generate 30 mock transactions for the last 30 days
    return Array.from({ length: 30 }, (_, i) => {
      const categoryIndex = Math.floor(Math.random() * mockCategories.length);
      const vendorIndex = Math.floor(Math.random() * mockVendors.length);
      const daysAgo = Math.floor(Math.random() * 30);
      const accountIds = ['mock-checking', 'mock-savings', 'mock-credit'];
      const accountIndex = Math.floor(Math.random() * accountIds.length);
      
      return {
        transaction_id: `mock-${i}`,
        amount: parseFloat((Math.random() * 200).toFixed(2)),
        date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
        name: mockVendors[vendorIndex],
        category: mockCategories[categoryIndex],
        account_id: accountIds[accountIndex],
        pending: Math.random() > 0.9 // 10% chance of being pending
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  // Apply filters to transactions based on current filter state
  const applyFilters = () => {
    // Either use filteredTransactions or remove it if it's not needed
    // This is a placeholder - you may need to adjust this based on how it's actually used
    const filteredTransactions = transactions.filter(transaction => {
      // Apply category filter
      if (filter.category && transaction.category !== filter.category) {
        return false;
      }
      
      // Apply account filter
      if (filter.accountId && transaction.account_id !== filter.accountId) {
        return false;
      }
      
      // Apply amount filters
      if (filter.minAmount && transaction.amount < filter.minAmount) {
        return false;
      }
      
      if (filter.maxAmount && transaction.amount > filter.maxAmount) {
        return false;
      }
      
      // Apply date range filter
      if (filter.startDate && new Date(transaction.date) < new Date(filter.startDate)) {
        return false;
      }
      
      if (filter.endDate && new Date(transaction.date) > new Date(filter.endDate)) {
        return false;
      }
      
      return true;
    });
    
    // Return or use filteredTransactions where needed
    setTransactions(filteredTransactions);
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      
      {/* Add Monthly Breakdown at the top */}
      <MonthlyBreakdown transactions={transactions} />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Transactions</h2>
          <button 
            onClick={() => fetchTransactions()} 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            <HiOutlineRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded flex items-start">
            <HiOutlineExclamationCircle className="text-blue-500 text-xl mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Using Sample Data</p>
              <p className="text-sm">We're displaying sample transaction data for demonstration purposes. In a production environment, this would connect to your real accounts.</p>
              <button 
                onClick={() => fetchTransactions()} 
                className="mt-2 text-sm text-blue-700 hover:text-blue-900 underline focus:outline-none"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Filter panel */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Accounts</option>
                {Array.isArray(accounts) && accounts.length > 0 ? (
                  accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No accounts available</option>
                )}
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Transactions list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-md">
            <p className="text-gray-600 mb-3">No transactions found for the selected period.</p>
            <p className="text-sm text-gray-500">Try changing your filters or connecting more accounts.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{transactions.length} transactions found</p>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HiOutlineDocumentDownload className="w-4 h-4 mr-1.5" />
                Export
              </button>
            </div>
            
            <div className="overflow-x-auto">
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
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id || `txn-${transaction.date}-${transaction.name}-${transaction.amount}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{getCategoryIcon(transaction.category)}</span>
                          {transaction.category?.[0] || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span className={transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 