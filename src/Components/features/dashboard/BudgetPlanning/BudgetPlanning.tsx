import React from 'react';

const BudgetPlanning: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Budget Planning</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Budget</h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Budget chart placeholder</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Adjust Budget
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Categories</h2>
          <ul className="space-y-2">
            <li className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Housing</span>
                <span className="font-semibold">$1,200 / $1,500</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Food & Dining</span>
                <span className="font-semibold">$450 / $500</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Transportation</span>
                <span className="font-semibold">$150 / $300</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Entertainment</span>
                <span className="font-semibold">$300 / $200</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Budget Planning Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
            <h3 className="font-medium mb-2">Budget Calculator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Estimate your monthly expenses and savings.</p>
            <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Open
            </button>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="font-medium mb-2">Savings Goals</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Set up and track your savings goals.</p>
            <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Open
            </button>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <h3 className="font-medium mb-2">Debt Repayment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Plan your debt repayment strategy.</p>
            <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;
