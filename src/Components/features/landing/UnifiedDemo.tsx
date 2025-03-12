import React from 'react';
import { motion } from 'framer-motion';
import { 
  BudgetDistributionChart, 
  ExpenseTrackingChart, 
  FinancialInsightsChart, 
  GoalTrackingChart 
} from './DemoCharts';

export const UnifiedDemo: React.FC = () => {
  // Features list for the demo section
  const features = [
    {
      id: 1,
      title: 'Smart Budgeting',
      description: 'Set custom budgets with AI-assisted categorization that adapts to your spending habits.',
      chart: <BudgetDistributionChart />,
    },
    {
      id: 2,
      title: 'Expense Tracking',
      description: 'Automatically categorize transactions and track expenses across all your accounts in one place.',
      chart: <ExpenseTrackingChart />,
    },
    {
      id: 3,
      title: 'Financial Insights',
      description: 'Receive personalized insights and recommendations to help optimize your spending and saving.',
      chart: <FinancialInsightsChart />,
    },
    {
      id: 4,
      title: 'Goal Setting',
      description: 'Create financial goals with progress tracking and smart recommendations to reach them faster.',
      chart: <GoalTrackingChart />,
    },
  ];

  return (
    <div className="py-10 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            A smarter way to <span className="text-indigo-600 dark:text-indigo-400">manage your finances</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400"
          >
            Our all-in-one platform combines intuitive design with powerful AI to help you take control of your finances.
          </motion.p>
        </div>

        {/* Grid Layout - 2x2 for larger screens, 1 column for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                  {feature.description}
                </p>
                <div className="h-52 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                  {feature.chart}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
