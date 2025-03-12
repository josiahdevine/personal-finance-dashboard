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
    <div className="relative py-10 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="relative px-4 sm:px-6 lg:px-8 mx-auto text-center">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            A smarter way to <span className="text-indigo-600 dark:text-indigo-400">manage your finances</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 max-w-2xl mx-auto text-base text-gray-500 dark:text-gray-400"
          >
            Our all-in-one platform combines intuitive design with powerful AI to help you take control of your finances.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                  {feature.description}
                </p>
                <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
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
