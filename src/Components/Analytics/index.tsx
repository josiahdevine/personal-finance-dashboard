import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  savingsRate: {
    month: string;
    rate: number;
  }[];
  topSpendingCategories: {
    category: string;
    amount: number;
  }[];
}

const FinancialAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [_analyticsData] = useState<AnalyticsData>({
    monthlyExpenses: [
      { month: 'Jan', amount: 3200 },
      { month: 'Feb', amount: 3400 },
      { month: 'Mar', amount: 3100 },
    ],
    categoryBreakdown: [
      { category: 'Housing', amount: 1500, percentage: 35 },
      { category: 'Food', amount: 600, percentage: 15 },
      { category: 'Transportation', amount: 400, percentage: 10 },
      { category: 'Utilities', amount: 300, percentage: 8 },
      { category: 'Entertainment', amount: 200, percentage: 5 },
      { category: 'Other', amount: 1000, percentage: 27 },
    ],
    savingsRate: [
      { month: 'Jan', rate: 15 },
      { month: 'Feb', rate: 18 },
      { month: 'Mar', rate: 20 },
    ],
    topSpendingCategories: [
      { category: 'Housing', amount: 1500 },
      { category: 'Food', amount: 600 },
      { category: 'Transportation', amount: 400 },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <div className="flex space-x-2">
            {(['1m', '3m', '6m', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-md ${
                  timeframe === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Expenses Chart */}
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
            <div className="h-64 flex items-end space-x-4">
              {/* Placeholder for actual chart - would use a library like recharts or chart.js */}
              <div className="flex-1 flex items-end space-x-2">
                {[3200, 3400, 3100].map((amount, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-indigo-600 rounded-t"
                    style={{ height: `${(amount / 4000) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending by Category</h2>
            <div className="space-y-4">
              {[
                { category: 'Housing', amount: 1500, percentage: 35, color: 'bg-blue-500' },
                { category: 'Food', amount: 600, percentage: 15, color: 'bg-green-500' },
                { category: 'Transportation', amount: 400, percentage: 10, color: 'bg-yellow-500' },
                { category: 'Utilities', amount: 300, percentage: 8, color: 'bg-red-500' },
                { category: 'Entertainment', amount: 200, percentage: 5, color: 'bg-purple-500' },
                { category: 'Other', amount: 1000, percentage: 27, color: 'bg-gray-500' },
              ].map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{category.category}</span>
                    <span>${category.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Savings Rate */}
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Savings Rate</h2>
            <div className="h-64 flex items-end space-x-4">
              {/* Placeholder for actual chart */}
              <div className="flex-1 flex items-end space-x-2">
                {[15, 18, 20].map((rate, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-green-500 rounded-t"
                    style={{ height: `${rate * 2}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Spending Categories */}
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Spending Categories</h2>
            <div className="space-y-4">
              {[
                { category: 'Housing', amount: 1500 },
                { category: 'Food', amount: 600 },
                { category: 'Transportation', amount: 400 },
              ].map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full font-semibold">
                      {index + 1}
                    </span>
                    <span className="ml-4 text-gray-900">{item.category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialAnalytics; 