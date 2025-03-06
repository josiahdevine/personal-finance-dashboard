import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  type: 'expense' | 'income' | 'savings';
  icon: string;
}

interface MonthlyBudget {
  month: string;
  year: number;
  totalBudgeted: number;
  totalSpent: number;
  categories: BudgetCategory[];
}

const BudgetPlanner: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('March');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const [budget] = useState<MonthlyBudget>({
    month: 'March',
    year: 2024,
    totalBudgeted: 5000,
    totalSpent: 3200,
    categories: [
      {
        id: '1',
        name: 'Housing',
        budgeted: 1500,
        spent: 1500,
        remaining: 0,
        type: 'expense',
        icon: '🏠',
      },
      {
        id: '2',
        name: 'Food & Dining',
        budgeted: 600,
        spent: 450,
        remaining: 150,
        type: 'expense',
        icon: '🍽️',
      },
      {
        id: '3',
        name: 'Transportation',
        budgeted: 400,
        spent: 320,
        remaining: 80,
        type: 'expense',
        icon: '🚗',
      },
      {
        id: '4',
        name: 'Utilities',
        budgeted: 300,
        spent: 280,
        remaining: 20,
        type: 'expense',
        icon: '💡',
      },
      {
        id: '5',
        name: 'Entertainment',
        budgeted: 200,
        spent: 150,
        remaining: 50,
        type: 'expense',
        icon: '🎬',
      },
      {
        id: '6',
        name: 'Savings',
        budgeted: 1000,
        spent: 500,
        remaining: 500,
        type: 'savings',
        icon: '💰',
      },
      {
        id: '7',
        name: 'Healthcare',
        budgeted: 300,
        spent: 0,
        remaining: 300,
        type: 'expense',
        icon: '🏥',
      },
      {
        id: '8',
        name: 'Shopping',
        budgeted: 400,
        spent: 0,
        remaining: 400,
        type: 'expense',
        icon: '🛍️',
      },
    ],
  });

  const totalRemaining = budget.totalBudgeted - budget.totalSpent;
  const spentPercentage = (budget.totalSpent / budget.totalBudgeted) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budget Planner</h1>
          <div className="flex space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-md"
            >
              {[2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Budgeted</h2>
            <p className="text-2xl font-bold text-indigo-600">
              ${budget.totalBudgeted.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h2>
            <p className="text-2xl font-bold text-red-600">
              ${budget.totalSpent.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h2>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalRemaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Progress</h2>
            <span className="text-sm font-medium text-gray-500">
              {spentPercentage.toFixed(1)}% spent
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budget.categories.map(category => {
            const spentPercentage = (category.spent / category.budgeted) * 100;
            return (
              <motion.div
                key={category.id}
                className="bg-white rounded-lg shadow p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    spentPercentage > 90 ? 'bg-red-100 text-red-800' :
                    spentPercentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {spentPercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>${category.spent.toLocaleString()} of ${category.budgeted.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          spentPercentage > 90 ? 'bg-red-500' :
                          spentPercentage > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-medium ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${category.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Category Button */}
        <motion.button
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default BudgetPlanner; 