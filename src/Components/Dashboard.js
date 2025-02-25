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

function DashboardPanel({ title, children, className, error, loading }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          <p>{error}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function Dashboard() {
  const [state, setState] = useState({
    netWorth: { data: null, loading: true, error: null },
    monthlyIncome: { data: 0, loading: true, error: null },
    spending: { data: null, loading: true, error: null },
    goals: { data: [], loading: true, error: null }
  });
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Helper function to handle API calls
      const fetchData = async (endpoint, stateKey, adapter) => {
        try {
          setState(prev => ({
            ...prev,
            [stateKey]: { ...prev[stateKey], loading: true, error: null }
          }));
          
          // Make sure endpoint has the correct format
          const formattedEndpoint = endpoint.startsWith('/api/') 
            ? endpoint 
            : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
          
          console.log(`[Dashboard] Fetching data from ${formattedEndpoint}`);
          
          try {
            const response = await api.get(formattedEndpoint);
            console.log(`[Dashboard] ${stateKey} raw data:`, response.data);
            
            // Apply adapter function if provided
            const processedData = adapter ? adapter(response.data) : response.data;
            console.log(`[Dashboard] ${stateKey} processed data:`, processedData);
            
            setState(prev => ({
              ...prev,
              [stateKey]: { data: processedData, loading: false, error: null }
            }));
          } catch (apiError) {
            console.error(`[Dashboard] API Error fetching ${stateKey}:`, apiError);
            
            // Create fallback mock data in case of API errors
            let mockData = null;
            
            // Use fallback mock data based on endpoint
            if (endpoint.includes('balance-history')) {
              mockData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                  label: 'Net Worth',
                  data: [10000, 12000, 13500, 14200, 15000],
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
              };
            } else if (endpoint.includes('monthly-summary')) {
              mockData = { average: 5000 };
            } else if (endpoint.includes('spending-summary')) {
              mockData = {
                total: 3500,
                categories: [
                  { name: 'Housing', amount: 1500 },
                  { name: 'Food', amount: 800 },
                  { name: 'Transportation', amount: 400 },
                  { name: 'Entertainment', amount: 300 },
                  { name: 'Other', amount: 500 }
                ]
              };
            } else if (endpoint.includes('goals')) {
              mockData = [
                { id: '1', name: 'Emergency Fund', current: 5000, target: 10000, progress: 50 },
                { id: '2', name: 'Vacation', current: 2000, target: 5000, progress: 40 },
                { id: '3', name: 'Down Payment', current: 15000, target: 50000, progress: 30 }
              ];
            }
            
            if (mockData) {
              console.log(`[Dashboard] Using mock data for ${stateKey}`, mockData);
              const processedMockData = adapter ? adapter(mockData) : mockData;
              
              setState(prev => ({
                ...prev,
                [stateKey]: { 
                  data: processedMockData, 
                  loading: false, 
                  error: `API Error: ${apiError.message}. Using mock data instead.` 
                }
              }));
            } else {
              setState(prev => ({
                ...prev,
                [stateKey]: {
                  data: prev[stateKey].data,
                  loading: false,
                  error: `Error: ${apiError.message || 'Failed to load data'}`
                }
              }));
            }
          }
        } catch (error) {
          console.error(`[Dashboard] Critical error in fetchData for ${stateKey}:`, error);
          setState(prev => ({
            ...prev,
            [stateKey]: {
              data: prev[stateKey].data,
              loading: false,
              error: `Critical Error: ${error.message || 'Unknown error occurred'}`
            }
          }));
        }
      };

      // Fetch all data with appropriate adapters
      fetchData('/api/plaid/balance-history', 'netWorth', adaptBalanceHistoryResponse);
      fetchData('/api/salary/monthly-summary', 'monthlyIncome', adaptMonthlySalaryResponse);
      fetchData('/api/transactions/spending-summary', 'spending', adaptSpendingSummaryResponse);
      fetchData('/api/goals', 'goals', adaptGoalsResponse);
    };

    fetchDashboardData();
  }, []);

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const netWorthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Net Worth Trend'
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financial Dashboard</h2>
        <button 
          onClick={toggleDebugMode}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          {debugMode ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      
      {debugMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-mono overflow-auto">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <p>API Base URL: {process.env.REACT_APP_API_URL || 'https://api.trypersonalfinance.com'}</p>
          <p>Current Window Origin: {window.location.origin}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
          <div className="mt-2">
            <p className="font-bold">Data State:</p>
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Worth Panel */}
        <DashboardPanel 
          title="Net Worth" 
          className="col-span-2"
          error={state.netWorth.error}
          loading={state.netWorth.loading}
        >
          {state.netWorth.data && typeof state.netWorth.data === 'object' && (
            <div className="h-64">
              {/* Check if data has the correct structure for the Line chart */}
              {state.netWorth.data.labels && state.netWorth.data.datasets ? (
                <Line data={state.netWorth.data} options={netWorthChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No net worth data available</p>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <a 
              href="/link-accounts" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Connect Accounts
            </a>
          </div>
        </DashboardPanel>

        {/* Monthly Income Panel */}
        <DashboardPanel 
          title="Monthly Income"
          error={state.monthlyIncome.error}
          loading={state.monthlyIncome.loading}
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${typeof state.monthlyIncome.data === 'object' && state.monthlyIncome.data !== null 
                ? (typeof state.monthlyIncome.data.average === 'number' 
                    ? state.monthlyIncome.data.average.toLocaleString() 
                    : '0')
                : (typeof state.monthlyIncome.data === 'number' 
                    ? state.monthlyIncome.data.toLocaleString() 
                    : '0')
              }
            </p>
            <p className="text-sm text-gray-600 mt-2">Average Monthly Income</p>
          </div>
          <div className="mt-4 flex justify-end">
            <a 
              href="/salary-journal" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Update Income
            </a>
          </div>
        </DashboardPanel>

        {/* Spending Analysis Panel */}
        <DashboardPanel 
          title="Monthly Spending"
          error={state.spending.error}
          loading={state.spending.loading}
        >
          {state.spending.data && typeof state.spending.data === 'object' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Spending</span>
                <span className="text-xl font-bold text-red-600">
                  ${typeof state.spending.data.total === 'number' 
                    ? state.spending.data.total.toLocaleString() 
                    : '0'}
                </span>
              </div>
              <div className="space-y-2">
                {Array.isArray(state.spending.data.categories) ? (
                  state.spending.data.categories.map((category, index) => (
                    <div key={category?.name || index} className="flex justify-between items-center">
                      <span className="text-gray-600">{category?.name || 'Other'}</span>
                      <span className="font-medium">${typeof category?.amount === 'number' 
                        ? category.amount.toLocaleString() 
                        : '0'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No category data available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No spending data available
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <a 
              href="/transactions" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Track Expenses
            </a>
          </div>
        </DashboardPanel>

        {/* Bills Analysis Panel */}
        <DashboardPanel title="Bills & Spending Analysis" className="col-span-2">
          <ErrorBoundary fallback={<div className="text-red-500">Error loading Bills Analysis</div>}>
            <BillsAnalysis />
          </ErrorBoundary>
          <div className="mt-4 flex justify-end">
            <a 
              href="/bills-analysis" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Manage Bills
            </a>
          </div>
        </DashboardPanel>

        {/* Financial Goals Panel */}
        <DashboardPanel 
          title="Financial Goals" 
          className="col-span-2"
          error={state.goals.error}
          loading={state.goals.loading}
        >
          {state.goals.data && Array.isArray(state.goals.data) && state.goals.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.goals.data.map((goal, index) => (
                <div key={goal?.id || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{goal?.name || `Goal ${index + 1}`}</h4>
                    <span className="text-sm text-gray-600">
                      {typeof goal?.progress === 'number' ? goal.progress : 0}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${typeof goal?.progress === 'number' ? goal.progress : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>${typeof goal?.current === 'number' ? goal.current.toLocaleString() : '0'}</span>
                    <span>${typeof goal?.target === 'number' ? goal.target.toLocaleString() : '0'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No financial goals set. Start by adding a goal!
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <a 
              href="/goals" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Set Goals
            </a>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

export default Dashboard;