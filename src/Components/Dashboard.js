import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
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

function DashboardPanel({ title, children, className }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function Dashboard() {
  const [netWorthData, setNetWorthData] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [spendingData, setSpendingData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch net worth history
        const netWorthResponse = await axios.get('/api/plaid/balance-history');
        
        // Fetch monthly income from salary entries
        const salaryResponse = await axios.get('/api/salary/monthly-summary');
        
        // Fetch spending data
        const spendingResponse = await axios.get('/api/transactions/spending-summary');
        
        // Fetch financial goals
        const goalsResponse = await axios.get('/api/goals');

        setNetWorthData(netWorthResponse.data);
        setMonthlyIncome(salaryResponse.data.monthlyIncome);
        setSpendingData(spendingResponse.data);
        setGoals(goalsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const netWorthChartOptions = {
    responsive: true,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Financial Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Worth Panel */}
        <DashboardPanel title="Net Worth" className="col-span-2">
          {netWorthData && (
            <div className="h-64">
              <Line data={netWorthData} options={netWorthChartOptions} />
            </div>
          )}
        </DashboardPanel>

        {/* Monthly Income Panel */}
        <DashboardPanel title="Monthly Income">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${monthlyIncome.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Average Monthly Income</p>
          </div>
        </DashboardPanel>

        {/* Spending Analysis Panel */}
        <DashboardPanel title="Monthly Spending">
          {spendingData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Spending</span>
                <span className="text-xl font-bold text-red-600">
                  ${spendingData.total.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {spendingData.categories.map(category => (
                  <div key={category.name} className="flex justify-between items-center">
                    <span className="text-gray-600">{category.name}</span>
                    <span className="font-medium">${category.amount.toLocaleString()}</span>
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
        <DashboardPanel title="Financial Goals" className="col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{goal.name}</h4>
                  <span className="text-sm text-gray-600">
                    {goal.progress}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>${goal.current.toLocaleString()}</span>
                  <span>${goal.target.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

export default Dashboard;