import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const GoalsTracker: React.FC = () => {
  const [goals, _setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
      deadline: '2024-12-31',
      category: 'Savings',
      priority: 'high',
      notes: 'Build 6 months of living expenses',
    },
    {
      id: '2',
      name: 'New Car Down Payment',
      targetAmount: 5000,
      currentAmount: 2000,
      deadline: '2024-09-30',
      category: 'Vehicle',
      priority: 'medium',
      notes: '20% down payment for a reliable used car',
    },
    {
      id: '3',
      name: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1500,
      deadline: '2024-06-30',
      category: 'Travel',
      priority: 'low',
      notes: 'Summer vacation savings',
    },
  ]);

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Goals</h1>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-semibold text-indigo-600">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Current: ${totalCurrentAmount.toLocaleString()}</span>
            <span>Target: ${totalTargetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <motion.div
                key={goal.id}
                className="bg-white rounded-lg shadow p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[goal.priority]}`}>
                    {goal.priority}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium text-gray-900">
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-medium text-gray-900">
                      ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium text-gray-900">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  {goal.notes && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="italic">{goal.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add New Goal Button */}
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

export default GoalsTracker; 