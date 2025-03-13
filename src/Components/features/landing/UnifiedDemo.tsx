import React from 'react';
import { motion } from 'framer-motion';
import { 
  BudgetDistributionChart, 
  ExpenseTrackingChart, 
  FinancialInsightsChart, 
  GoalTrackingChart 
} from './DemoCharts';
import { FeatureCard } from '../../marketing/FeatureCard';
import { PieChart, LineChart, Wallet, Target } from 'lucide-react';

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  chart: React.ReactNode;
  icon: React.ReactNode;
  span?: 'col' | 'row' | 'full';
}

/**
 * UnifiedDemo - Displays featured functionality in a grid layout
 * 
 * Features:
 * - Responsive grid with custom layout (1 column on mobile, specified grid on desktop)
 * - Animated entrance with Framer Motion
 * - Uses shared FeatureCard component for consistency
 * - Accessible structure with proper ARIA attributes
 * - Dark mode compatible
 */
export const UnifiedDemo: React.FC = () => {
  // Features list for the demo section
  const features: FeatureItem[] = [
    {
      id: 1,
      title: 'Smart Budgeting',
      description: 'Set custom budgets with AI-assisted categorization that adapts to your spending habits.',
      chart: <BudgetDistributionChart />,
      icon: <PieChart className="h-6 w-6 text-primary" />,
      span: 'col'
    },
    {
      id: 2,
      title: 'Goal Setting',
      description: 'Create financial goals with progress tracking and smart recommendations to reach them faster.',
      chart: <GoalTrackingChart />,
      icon: <Target className="h-6 w-6 text-primary" />,
      span: 'col'
    },
    {
      id: 3,
      title: 'Expense Tracking',
      description: 'Automatically categorize transactions and track expenses across all your accounts in one place.',
      chart: <ExpenseTrackingChart />,
      icon: <Wallet className="h-6 w-6 text-primary" />,
      span: 'row'
    },
    {
      id: 4,
      title: 'Financial Insights',
      description: 'Receive personalized insights and recommendations to help optimize your spending and saving.',
      chart: <FinancialInsightsChart />,
      icon: <LineChart className="h-6 w-6 text-primary" />,
      span: 'row'
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="py-10 bg-white dark:bg-gray-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            A smarter way to <span className="text-indigo-600 dark:text-indigo-400">manage your finances</span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400"
          >
            Our all-in-one platform combines intuitive design with powerful AI to help you take control of your finances.
          </motion.p>
        </div>

        {/* Custom Grid Layout - Following the 3 vertical and 2 horizontal design */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center"
          role="list"
          aria-label="Finance features"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className={`w-full ${
                feature.span === 'row' ? 'md:col-span-2' : 
                feature.span === 'full' ? 'md:col-span-2' : ''
              }`}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              >
                <div 
                  className="mt-4 h-40 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {feature.chart}
                </div>
              </FeatureCard>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
