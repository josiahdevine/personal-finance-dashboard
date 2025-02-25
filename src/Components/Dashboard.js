import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Helper function to handle API calls
      const fetchData = async (endpoint, stateKey) => {
        try {
          setState(prev => ({
            ...prev,
            [stateKey]: { ...prev[stateKey], loading: true, error: null }
          }));
          
          const response = await api.get(endpoint);
          console.log(`${stateKey} data:`, response.data);
          
          setState(prev => ({
            ...prev,
            [stateKey]: { data: response.data, loading: false, error: null }
          }));
        } catch (error) {
          console.error(`Error fetching ${stateKey}:`, error);
          setState(prev => ({
            ...prev,
            [stateKey]: {
              data: prev[stateKey].data, // Preserve any existing data
              loading: false,
              error: error.message || `Failed to load ${stateKey} data`
            }
          }));
        }
      };

      // Fetch all data
      fetchData('/api/plaid/balance-history', 'netWorth');
      fetchData('/api/salary/monthly-summary', 'monthlyIncome');
      fetchData('/api/transactions/spending-summary', 'spending');
      fetchData('/api/goals', 'goals');
    };

    fetchDashboardData();
  }, []);

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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Financial Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Worth Panel */}
        <DashboardPanel 
          title="Net Worth" 
          className="col-span-2"
          error={state.netWorth.error}
          loading={state.netWorth.loading}
        >
          {state.netWorth.data && (
            <div className="h-64">
              <Line data={state.netWorth.data} options={netWorthChartOptions} />
            </div>
          )}
        </DashboardPanel>

        {/* Monthly Income Panel */}
        <DashboardPanel 
          title="Monthly Income"
          error={state.monthlyIncome.error}
          loading={state.monthlyIncome.loading}
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${state.monthlyIncome.data?.average?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Average Monthly Income</p>
          </div>
        </DashboardPanel>

        {/* Spending Analysis Panel */}
        <DashboardPanel 
          title="Monthly Spending"
          error={state.spending.error}
          loading={state.spending.loading}
        >
          {state.spending.data && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Spending</span>
                <span className="text-xl font-bold text-red-600">
                  ${state.spending.data.total?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="space-y-2">
                {state.spending.data.categories && state.spending.data.categories.map((category, index) => (
                  <div key={category.name || index} className="flex justify-between items-center">
                    <span className="text-gray-600">{category.name || 'Other'}</span>
                    <span className="font-medium">${category.amount?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DashboardPanel>

        {/* Bills Analysis Panel */}
        <DashboardPanel title="Bills & Spending Analysis" className="col-span-2">
          <BillsAnalysis />
        </DashboardPanel>

        {/* Financial Goals Panel */}
        <DashboardPanel 
          title="Financial Goals" 
          className="col-span-2"
          error={state.goals.error}
          loading={state.goals.loading}
        >
          {state.goals.data && state.goals.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.goals.data.map(goal => (
                <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{goal.name}</h4>
                    <span className="text-sm text-gray-600">
                      {goal.progress || 0}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${goal.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>${(goal.current || 0).toLocaleString()}</span>
                    <span>${(goal.target || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No financial goals set. Start by adding a goal!
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}

export default Dashboard;