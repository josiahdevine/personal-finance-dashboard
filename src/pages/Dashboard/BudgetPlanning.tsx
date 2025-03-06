import React, { useState } from 'react';
import {
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface MonthlyBudget {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export const BudgetPlanning: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - replace with real data from your backend
  const categories: BudgetCategory[] = [
    { id: '1', name: 'Housing', budgeted: 2000, spent: 1800, color: '#4F46E5' },
    { id: '2', name: 'Transportation', budgeted: 500, spent: 450, color: '#7C3AED' },
    { id: '3', name: 'Food', budgeted: 600, spent: 580, color: '#EC4899' },
    { id: '4', name: 'Entertainment', budgeted: 300, spent: 250, color: '#F59E0B' },
    { id: '5', name: 'Utilities', budgeted: 400, spent: 380, color: '#10B981' },
  ];

  const monthlyData: MonthlyBudget[] = [
    { month: 'Jan', income: 5000, expenses: 3800, savings: 1200 },
    { month: 'Feb', income: 5200, expenses: 3900, savings: 1300 },
    { month: 'Mar', income: 5100, expenses: 3700, savings: 1400 },
    { month: 'Apr', income: 5300, expenses: 4000, savings: 1300 },
    { month: 'May', income: 5400, expenses: 3800, savings: 1600 },
    { month: 'Jun', income: 5200, expenses: 3900, savings: 1300 },
  ];

  const budgetOverviewData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        borderColor: '#EC4899',
        backgroundColor: '#EC4899',
        tension: 0.4,
      },
      {
        label: 'Savings',
        data: monthlyData.map(d => d.savings),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.4,
      },
    ],
  };

  const categorySpendingData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: 'Budgeted',
        data: categories.map(c => c.budgeted),
        backgroundColor: categories.map(c => c.color),
      },
      {
        label: 'Spent',
        data: categories.map(c => c.spent),
        backgroundColor: categories.map(c => `${c.color}80`),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Budget Planning</h1>
          <div className="flex space-x-4">
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Budget Category
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">$3,800</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                    <dd className="text-lg font-medium text-gray-900">$3,460</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Remaining</dt>
                    <dd className="text-lg font-medium text-gray-900">$340</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
            <div className="h-80">
              <Line data={budgetOverviewData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Spending</h3>
            <div className="h-80">
              <Bar data={categorySpendingData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Category List */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {categories.map((category) => {
              const progress = (category.spent / category.budgeted) * 100;
              return (
                <li
                  key={category.id}
                  className={`hover:bg-gray-50 ${
                    selectedCategory === category.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <ChartBarIcon
                            className="h-6 w-6"
                            style={{ color: category.color }}
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">
                            ${category.spent} of ${category.budgeted}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}; 