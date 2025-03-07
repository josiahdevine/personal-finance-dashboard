import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
}

const AnalyticsOverview: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

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
  }, [timeframe]); // Refetch when timeframe changes

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Card.Header>
                <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {data.categoryBreakdown.map(category => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
      </motion.div>
    </div>
  );
};

export default AnalyticsOverview;
