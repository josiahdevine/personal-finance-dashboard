import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const containerRef = useRef();

  const features = [
    {
      title: "Track Your Net Worth",
      description: "Connect all your financial accounts in one place. Watch your wealth grow with real-time updates and beautiful visualizations.",
      icon: "📈"
    },
    {
      title: "Smart Budgeting",
      description: "Set intelligent budgets that adapt to your spending patterns. Get insights and recommendations to help you save more.",
      icon: "💰"
    },
    {
      title: "Investment Portfolio",
      description: "Track your investments across multiple platforms. Get a consolidated view of your stocks, crypto, and other assets.",
      icon: "📊"
    },
    {
      title: "Secure & Private",
      description: "Bank-level security with end-to-end encryption. Your financial data is always protected and private.",
      icon: "🔒"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="h-screen flex flex-col items-center justify-center text-center px-4"
      >
        <h1 className="text-6xl font-bold mb-6">
          Your Personal Finance Dashboard
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          Take control of your financial future with our powerful, all-in-one dashboard
        </p>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-transparent border border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 text-center"
      >
        <h2 className="text-4xl font-bold mb-8">Ready to Take Control?</h2>
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
        >
          Start Your Financial Journey
        </Link>
      </motion.div>
    </div>
  );
};

export default LandingPage; 