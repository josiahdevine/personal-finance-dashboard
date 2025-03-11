import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

export const Hero: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 opacity-80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-400 dark:bg-indigo-700 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            <span className="block">Your Money.</span>
            <span className="block text-blue-600 dark:text-blue-400">Reimagined.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-lg mx-auto text-xl text-gray-600 dark:text-gray-300"
          >
            Experience the future of personal finance with AI-powered insights and beautiful visualizations.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center"
          >
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link to="/register">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 w-full"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/features">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  } md:py-4 md:text-lg md:px-10 w-full`}
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-16 lg:max-w-4xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-4xl">
            <div className={`relative block w-full rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? 'border border-gray-700' : ''
            }`}>
              <img
                className="w-full"
                src="/assets/dashboard-preview.png"
                alt="FinanceDash dashboard preview"
                onError={(e) => {
                  // If image fails to load, show a fallback div
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentNode as HTMLElement;
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-96 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold';
                  fallback.innerText = 'Financial Dashboard Preview';
                  parent.replaceChild(fallback, target);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
