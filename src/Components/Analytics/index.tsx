<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface AnalyticsData {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthOverMonthGrowth: number;
  recurringExpenses: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
  cashFlow: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

const AnalyticsOverview: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'No data available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Overview</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Income</div>
                <div className="text-2xl font-bold text-green-600">
                  ${data.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  ${data.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Net</div>
                <div className="text-2xl font-bold text-indigo-600">
                  ${(data.monthlyIncome - data.monthlyExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Savings Rate</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              {data.savingsRate.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-600 rounded-full"
                style={{ width: `${Math.min(data.savingsRate, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Month over Month Growth: {' '}
              <span className={data.monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {data.monthOverMonthGrowth >= 0 ? '+' : ''}{data.monthOverMonthGrowth.toFixed(1)}%
              </span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Top Expenses</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {data.topExpenseCategories.map(category => (
                <div key={category.category} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{category.category}</div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
=======
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
>>>>>>> 234e2586c127906a5f392b4d4ea17df505736af7
                  </div>
                </div>
              ))}
            </div>
<<<<<<< HEAD
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Recurring Expenses</h2>
          </Card.Header>
          <Card.Body>
            <div className="divide-y divide-gray-200">
              {data.recurringExpenses.map(expense => (
                <div key={expense.name} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{expense.name}</div>
                    <div className="text-xs text-gray-500">{expense.category}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Cash Flow Trend</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {data.cashFlow.map(flow => (
                <div key={flow.date} className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {new Date(flow.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-green-600">+${flow.income.toLocaleString()}</span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="text-red-600">-${flow.expenses.toLocaleString()}</span>
                    </div>
                    <div className={`text-sm font-medium ${flow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(flow.net).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
=======
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
>>>>>>> 234e2586c127906a5f392b4d4ea17df505736af7
    </div>
  );
};

<<<<<<< HEAD
export default AnalyticsOverview; 
=======
export default FinancialAnalytics; 
>>>>>>> 234e2586c127906a5f392b4d4ea17df505736af7
