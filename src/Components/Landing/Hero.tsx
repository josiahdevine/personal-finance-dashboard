import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HeroProps {
  theme: 'dark' | 'light' | 'system';
}

export const Hero: React.FC<HeroProps> = ({ theme }) => {
  // Determine actual theme value if 'system' is provided
  const effectiveTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <div className={`relative overflow-hidden pt-32 pb-16 sm:pb-24 ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:col-span-6 lg:flex lg:items-center lg:px-0 lg:text-left"
          >
            <div>
              <h1 className={`text-4xl font-bold tracking-tight sm:text-6xl lg:mt-6 xl:text-6xl ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="block">Take control of</span>
                <span className="block text-blue-600">your finances</span>
              </h1>
              <p className={`mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Track your spending, manage investments, and reach your financial goals with our AI-powered personal finance dashboard.
              </p>
              <div className="mt-8 sm:mt-12">
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                </Link>
                <Link
                  to="/demo"
                  className={`ml-4 inline-flex items-center rounded-md border ${
                    effectiveTheme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } px-6 py-3 text-base font-medium`}
                >
                  View Demo
                </Link>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-12 sm:mt-16 lg:col-span-6 lg:mt-0"
          >
            <div className="relative mx-auto w-full rounded-lg shadow-xl lg:max-w-md">
              <div className={`relative block w-full overflow-hidden rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <img
                  className="w-full"
                  src="/dashboard-preview.png"
                  alt="Dashboard Preview"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 