import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedDemo } from '../../../components/Landing/UnifiedDemo';

interface FeaturesProps {
  theme?: 'dark' | 'light';
}

const features = [
  {
    title: 'Smart Budgeting',
    description: 'AI-powered budgeting that learns and adapts to your spending habits',
    icon: '📊',
  },
  {
    title: 'Bank Integration',
    description: 'Securely connect your bank accounts for real-time transaction tracking',
    icon: '🏦',
  },
  {
    title: 'Expense Analytics',
    description: 'Detailed insights into your spending patterns with beautiful visualizations',
    icon: '📈',
  },
];

export const Features: React.FC<FeaturesProps> = ({ theme = 'dark' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className={`relative py-32 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-8 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Powerful features for
            <br />
            <span className={`bg-gradient-to-r ${
              theme === 'dark'
                ? 'from-blue-400 to-purple-600'
                : 'from-indigo-600 to-blue-500'
            } text-transparent bg-clip-text`}>
              modern finance
            </span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`rounded-xl shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-4">
                {feature.title}
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Demo */}
        <UnifiedDemo />
      </div>
    </div>
  );
}; 