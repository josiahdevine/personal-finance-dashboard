import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { DisplayMode } from '../../types/enums';

export const CTA: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme.mode === DisplayMode.DARK;

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

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className={`rounded-2xl py-10 px-6 md:py-16 md:px-12 overflow-hidden shadow-xl ${
            isDarkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          } relative`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Background elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
              <motion.h2 
                className="text-3xl font-bold text-white sm:text-4xl"
                variants={itemVariants}
              >
                Ready to take control of your finances?
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg text-blue-100 max-w-2xl"
                variants={itemVariants}
              >
                Join thousands of users who have already transformed their financial lives with FinanceDash. 
                Sign up today and get a 30-day free trial with all premium features.
              </motion.p>
            </div>
            <motion.div variants={itemVariants}>
              <Link to="/register">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 shadow-lg"
                >
                  Get Started for Free
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </Link>
              <p className="mt-3 text-sm text-blue-100 text-center">
                No credit card required
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
