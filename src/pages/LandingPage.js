import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import AuthMenu from '../Components/AuthMenu';

console.log('LandingPage.js: Initializing LandingPage component');

// Log component imports
console.log('LandingPage.js: AuthMenu import check:', {
  AuthMenu: typeof AuthMenu === 'function' ? 'Function Component' : typeof AuthMenu,
  AuthMenuExists: !!AuthMenu
});

// Register ChartJS components
console.log('LandingPage.js: Registering ChartJS components');
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
  console.log('LandingPage.js: ChartJS components registered successfully');
} catch (error) {
  console.error('LandingPage.js: Error registering ChartJS components:', error);
}

const LandingPage = () => {
  console.log('LandingPage.js: LandingPage component rendering');
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);

  useEffect(() => {
    console.log('LandingPage.js: LandingPage component mounted');
    return () => {
      console.log('LandingPage.js: LandingPage component unmounting');
    };
  }, []);

  // Log when AuthMenu opens/closes
  useEffect(() => {
    console.log('LandingPage.js: AuthMenu state changed:', { isOpen: isAuthMenuOpen });
  }, [isAuthMenuOpen]);

  // Sample data for charts
  const netWorthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Net Worth',
        data: [30000, 35000, 32000, 37000, 42000, 45000],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const investmentData = {
    labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash', 'Crypto'],
    datasets: [
      {
        data: [40, 20, 15, 15, 10],
        backgroundColor: [
          'rgb(37, 99, 235)',
          'rgb(59, 130, 246)',
          'rgb(147, 197, 253)',
          'rgb(191, 219, 254)',
          'rgb(219, 234, 254)'
        ]
      }
    ]
  };

  const monthlySpendingData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: [6000, 6000, 6000, 6500, 6500, 6500],
        backgroundColor: 'rgb(37, 99, 235)',
      },
      {
        label: 'Expenses',
        data: [4200, 4500, 4100, 4300, 4600, 4400],
        backgroundColor: 'rgb(147, 197, 253)',
      }
    ]
  };

  const features = [
    {
      title: "Comprehensive Financial Overview",
      description: "Get a clear picture of your entire financial life with our intuitive dashboard. Track your net worth, investments, and spending all in one place.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    {
      title: "Investment Portfolio Tracking",
      description: "Monitor your investments across multiple platforms. Get real-time updates on your stocks, ETFs, and cryptocurrency holdings.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    {
      title: "Smart Budgeting Tools",
      description: "Take control of your spending with our AI-powered budgeting tools. Get personalized insights and recommendations to help you save more.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption and security measures. We use the same security standards as major financial institutions.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    }
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">Finance Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAuthMenuOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AuthMenu isOpen={isAuthMenuOpen} onClose={() => setIsAuthMenuOpen(false)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Take Control of Your Financial Future
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Track your net worth, investments, and spending all in one place. Get personalized insights to help you grow your wealth.
              </p>
              <button
                onClick={() => setIsAuthMenuOpen(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Your Journey
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <Line data={netWorthData} options={chartOptions} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Investment Allocation</h3>
              <Doughnut data={investmentData} options={{ ...chartOptions, cutout: '60%' }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Income vs Expenses</h3>
              <Bar data={monthlySpendingData} options={chartOptions} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Transform Your Financial Life?</h2>
          <button
            onClick={() => setIsAuthMenuOpen(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 