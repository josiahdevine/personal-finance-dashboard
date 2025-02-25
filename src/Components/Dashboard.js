import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useFinanceData } from '../contexts/FinanceDataContext';
import { useAuth } from '../contexts/AuthContext';
import { log, logError } from '../utils/logger';
import { Link } from 'react-router-dom';
import BillsAnalysis from './BillsAnalysis';
import { 
  adaptBalanceHistoryResponse, 
  adaptMonthlySalaryResponse, 
  adaptSpendingSummaryResponse, 
  adaptGoalsResponse 
} from '../api-adapters';

// Create a simple ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// DashboardPanel component for consistent UI across dashboard sections
function DashboardPanel({ title, children, className, error, loading, linkTo }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {linkTo && (
          <Link 
            to={linkTo} 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      
      {error ? (
        <div className="bg-red-50 p-3 rounded border border-red-200 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    financialSummary, 
    loading: financeDataLoading,
    monthlyExpenses,
    salaryEntries,
    financialGoals,
    recentTransactions
  } = useFinanceData();
  
  const [dashboardData, setDashboardData] = useState({
    balanceHistory: null,
    spendingSummary: null,
    monthlySalary: null,
    goals: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    log('Dashboard', 'Dashboard component mounted');
    
    // If we have data from the finance context, no need to fetch from API
    if (!financeDataLoading && Object.keys(financialSummary).length > 0) {
      setLoading(false);
      return;
    }
    
    // Only fetch from API if we don't have data in the context
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data from API if needed
        // This would be replaced by the data from the context
        log('Dashboard', 'Fetching dashboard data from API');
        // API calls would go here
        
        setLoading(false);
      } catch (err) {
        logError('Dashboard', 'Error fetching dashboard data', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    return () => {
      log('Dashboard', 'Dashboard component unmounting');
    };
  }, [currentUser, financeDataLoading, financialSummary]);

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Derive colors based on values
  const getIncomeExpenseColors = () => {
    if (financialSummary.monthlySavings > 0) {
      return {
        savingsColor: 'text-green-600',
        savingsBg: 'bg-green-100'
      };
    } else {
      return {
        savingsColor: 'text-red-600',
        savingsBg: 'bg-red-100'
      };
    }
  };

  const { savingsColor, savingsBg } = getIncomeExpenseColors();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {currentUser?.displayName || 'there'}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your finances
        </p>
      </div>
      
      {/* Financial Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardPanel 
          title="Monthly Income" 
          loading={loading && financeDataLoading}
          error={error}
          linkTo="/salary-journal"
          className="bg-blue-50"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(financialSummary.monthlyIncome)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {salaryEntries?.length > 0 ? 'Last updated: ' + new Date(salaryEntries[0]?.date).toLocaleDateString() : 'No salary entries yet'}
            </p>
          </div>
        </DashboardPanel>
      
        <DashboardPanel 
          title="Monthly Expenses" 
          loading={loading && financeDataLoading}
          error={error}
          linkTo="/bills-analysis"
          className="bg-red-50"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(financialSummary.monthlyExpenses)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {monthlyExpenses?.length > 0 ? monthlyExpenses.length + ' expenses tracked' : 'No expenses tracked yet'}
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel 
          title="Monthly Savings" 
          loading={loading && financeDataLoading}
          error={error}
          className={savingsBg}
        >
          <div className="text-center">
            <p className={`text-2xl font-bold ${savingsColor}`}>
              {formatCurrency(financialSummary.monthlySavings)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Savings Rate: {financialSummary.savingsRate}%
            </p>
          </div>
        </DashboardPanel>
      </div>

      {/* Detailed Financial Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Expense Breakdown */}
        <DashboardPanel 
          title="Expense Breakdown" 
          loading={loading && financeDataLoading}
          error={error}
          linkTo="/bills-analysis"
        >
          {Object.keys(financialSummary.expenseBreakdown || {}).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(financialSummary.expenseBreakdown || {})
                .sort(([_, a], [__, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-700">{category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round((amount / financialSummary.monthlyExpenses) * 100)}%)
                </span>
                    </div>
              </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No expense data available.</p>
              <Link to="/bills-analysis" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                Add your first expense
              </Link>
            </div>
          )}
        </DashboardPanel>

        {/* Financial Goals */}
        <DashboardPanel 
          title="Financial Goals" 
          loading={loading && financeDataLoading}
          error={error}
          linkTo="/goals"
        >
          {financialSummary.topGoals?.length > 0 ? (
            <div className="space-y-4">
              {financialSummary.topGoals.map(goal => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{goal.name}</span>
                    <span className="text-xs text-gray-600">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No financial goals set.</p>
              <Link to="/goals" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                Set your first goal
              </Link>
            </div>
          )}
        </DashboardPanel>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <DashboardPanel 
          title="Recent Transactions" 
          loading={loading && financeDataLoading}
          error={error}
          linkTo="/transactions"
        >
          {financialSummary.recentTransactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialSummary.recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No transaction data available.</p>
              <Link to="/link-accounts" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                Link your accounts to see transactions
              </Link>
          </div>
          )}
        </DashboardPanel>
      </div>

      {debugMode && (
        <pre className="mt-8 p-4 bg-gray-100 rounded overflow-auto text-xs">
          {JSON.stringify({ financialSummary, salaryEntries, monthlyExpenses, financialGoals }, null, 2)}
        </pre>
      )}

      <div className="text-center mt-8">
        <button 
          onClick={toggleDebugMode} 
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {debugMode ? 'Hide' : 'Show'} Debug Data
        </button>
      </div>
    </div>
  );
}

export default Dashboard;