import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * Props for the Dashboard component.
 * @property className - Optional className for styling
 */
interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Sample data - replace with real data from your backend
  const netWorthData = [
    { month: 'Jan', value: 25000 },
    { month: 'Feb', value: 27000 },
    { month: 'Mar', value: 28500 },
    { month: 'Apr', value: 29800 },
    { month: 'May', value: 31200 },
    { month: 'Jun', value: 32500 },
  ];

  const assetAllocation = [
    { name: 'Stocks', value: 60 },
    { name: 'Bonds', value: 20 },
    { name: 'Cash', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-lg shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:shadow-md hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Net Worth</h3>
          <p className="text-3xl font-bold text-indigo-600">$32,500</p>
          <p className="text-sm text-green-600 mt-2">↑ 8.3% from last month</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:shadow-md hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Savings</h3>
          <p className="text-3xl font-bold text-indigo-600">$1,250</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:shadow-md hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Expenses</h3>
          <p className="text-3xl font-bold text-indigo-600">$3,800</p>
          <p className="text-sm text-red-600 mt-2">↑ 5.2% from last month</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Net Worth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Asset Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            {
              type: 'expense',
              description: 'Monthly Rent',
              amount: -2000,
              date: '2024-02-01',
            },
            {
              type: 'income',
              description: 'Salary Deposit',
              amount: 5000,
              date: '2024-02-01',
            },
            {
              type: 'investment',
              description: 'Stock Purchase - AAPL',
              amount: -1500,
              date: '2024-01-31',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activity.type === 'income'
                      ? 'bg-green-500'
                      : activity.type === 'expense'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 