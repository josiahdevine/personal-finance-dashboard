import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { DisplayMode } from '../../types/enums';
import { RiDashboardLine, RiPieChartLine, RiNotification3Line, RiLockLine, RiDatabase2Line, RiRobot2Line } from 'react-icons/ri';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const Features: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme.mode === DisplayMode.DARK;

  const features: FeatureItem[] = [
    {
      id: 'dashboard',
      title: 'Interactive Dashboard',
      description: 'Get a complete overview of your finances with our beautiful and intuitive dashboard.',
      icon: <RiDashboardLine className="w-6 h-6" />,
    },
    {
      id: 'insights',
      title: 'AI-Powered Insights',
      description: 'Our AI analyzes your spending patterns to provide personalized recommendations.',
      icon: <RiRobot2Line className="w-6 h-6" />,
    },
    {
      id: 'budgeting',
      title: 'Smart Budgeting',
      description: 'Create custom budgets that adapt to your spending habits and financial goals.',
      icon: <RiPieChartLine className="w-6 h-6" />,
    },
    {
      id: 'security',
      title: 'Bank-Level Security',
      description: 'Your data is protected with industry-leading encryption and security practices.',
      icon: <RiLockLine className="w-6 h-6" />,
    },
    {
      id: 'integration',
      title: 'Seamless Integration',
      description: 'Connect all your accounts in one place for a complete financial picture.',
      icon: <RiDatabase2Line className="w-6 h-6" />,
    },
    {
      id: 'alerts',
      title: 'Real-Time Alerts',
      description: 'Get notified about unusual activity, upcoming bills, and savings opportunities.',
      icon: <RiNotification3Line className="w-6 h-6" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className={`text-base text-blue-600 font-semibold tracking-wide uppercase`}>
            Features
          </h2>
          <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
            A better way to manage your finances
          </p>
          <p className={`mt-4 max-w-2xl text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} lg:mx-auto`}>
            FinanceDash combines powerful financial tools with intuitive design to help you take control of your money.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors duration-300`}
              variants={itemVariants}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-md ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                {feature.icon}
              </div>
              <h3 className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
