import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Spending</h2>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$4,782.50</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          <div className="mt-2 text-sm">
            <span className="text-red-500">+12.5%</span> vs last month
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">$7,500.00</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          <div className="mt-2 text-sm">
            <span className="text-green-500">+3.2%</span> vs last month
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Savings Rate</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">36.2%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">of income saved</p>
          <div className="mt-2 text-sm">
            <span className="text-green-500">+2.1%</span> vs last month
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Spending pie chart placeholder</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
          <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Trends line chart placeholder</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Financial Insights</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">
              Last 30 days
            </button>
            <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md">
              Last 90 days
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">
              Last year
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-md">
            <h3 className="text-lg font-medium text-green-700 dark:text-green-400">Positive Trend</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your food spending has decreased by 15% compared to last month. Keep up the good work!
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-md">
            <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-400">Recommendation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Consider setting up automatic transfers to your savings account to reach your vacation goal faster.
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Alert</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your entertainment category spending is 25% over budget this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
