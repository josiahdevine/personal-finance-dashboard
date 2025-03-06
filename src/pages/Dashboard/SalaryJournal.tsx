import React, { useState } from 'react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  GiftIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SalaryEntry {
  id: string;
  date: string;
  amount: number;
  company: string;
  position: string;
  type: 'salary' | 'bonus' | 'benefits';
  description?: string;
}

interface SalaryStats {
  totalYTD: number;
  monthlyAverage: number;
  totalBonuses: number;
  yearOverYearGrowth: number;
}

export const SalaryJournal: React.FC = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [viewType, setViewType] = useState('list');
  const [showAddEntry, setShowAddEntry] = useState(false);

  // Mock data - replace with real data from your backend
  const salaryEntries: SalaryEntry[] = [
    {
      id: '1',
      date: '2024-02-01',
      amount: 4200.00,
      company: 'Tech Corp',
      position: 'Senior Developer',
      type: 'salary',
      description: 'Monthly salary',
    },
    {
      id: '2',
      date: '2024-02-01',
      amount: 500.00,
      company: 'Tech Corp',
      position: 'Senior Developer',
      type: 'benefits',
      description: 'Health insurance',
    },
    {
      id: '3',
      date: '2024-01-15',
      amount: 2000.00,
      company: 'Tech Corp',
      position: 'Senior Developer',
      type: 'bonus',
      description: 'Performance bonus',
    },
  ];

  const monthlyData = [
    { month: 'Jan', salary: 4200, bonus: 2000, benefits: 500 },
    { month: 'Feb', salary: 4200, bonus: 0, benefits: 500 },
    { month: 'Mar', salary: 4200, bonus: 0, benefits: 500 },
    { month: 'Apr', salary: 4300, bonus: 1500, benefits: 500 },
    { month: 'May', salary: 4300, bonus: 0, benefits: 500 },
    { month: 'Jun', salary: 4300, bonus: 0, benefits: 500 },
  ];

  const stats: SalaryStats = {
    totalYTD: 50400.00,
    monthlyAverage: 4200.00,
    totalBonuses: 2000.00,
    yearOverYearGrowth: 8.5,
  };

  const incomeBreakdownData = {
    labels: ['Base Salary', 'Bonuses', 'Benefits'],
    datasets: [
      {
        data: [50400, 3500, 6000],
        backgroundColor: ['#4F46E5', '#EC4899', '#10B981'],
        borderColor: ['#4F46E5', '#EC4899', '#10B981'],
      },
    ],
  };

  const incomeHistoryData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Base Salary',
        data: monthlyData.map(d => d.salary),
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5',
        tension: 0.4,
      },
      {
        label: 'Bonuses',
        data: monthlyData.map(d => d.bonus),
        borderColor: '#EC4899',
        backgroundColor: '#EC4899',
        tension: 0.4,
      },
      {
        label: 'Benefits',
        data: monthlyData.map(d => d.benefits),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.4,
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

  const getEntryIcon = (type: SalaryEntry['type']) => {
    switch (type) {
      case 'salary':
        return BanknotesIcon;
      case 'bonus':
        return GiftIcon;
      case 'benefits':
        return BuildingOfficeIcon;
    }
  };

  const getEntryColor = (type: SalaryEntry['type']) => {
    switch (type) {
      case 'salary':
        return 'text-indigo-600 bg-indigo-100';
      case 'bonus':
        return 'text-pink-600 bg-pink-100';
      case 'benefits':
        return 'text-emerald-600 bg-emerald-100';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Journal</h1>
          <div className="flex space-x-4">
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
            >
              <option value="list">List View</option>
              <option value="chart">Chart View</option>
            </select>
            <button
              onClick={() => setShowAddEntry(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Income YTD</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.totalYTD.toFixed(2)}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Average</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.monthlyAverage.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GiftIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bonuses YTD</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.totalBonuses.toFixed(2)}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">YoY Growth</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.yearOverYearGrowth}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {viewType === 'chart' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Income History</h3>
              <div className="h-80">
                <Line data={incomeHistoryData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Income Breakdown</h3>
              <div className="h-80">
                <Doughnut data={incomeBreakdownData} options={{ ...chartOptions, cutout: '70%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Salary Entries List */}
        {viewType === 'list' && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {salaryEntries.map((entry) => {
                const Icon = getEntryIcon(entry.type);
                const colorClass = getEntryColor(entry.type);
                return (
                  <li key={entry.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{entry.company}</p>
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {entry.position}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{entry.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="ml-2 flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-900">${entry.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{entry.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Add Salary Entry</h3>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value="salary">Salary</option>
                    <option value="bonus">Bonus</option>
                    <option value="benefits">Benefits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddEntry(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 