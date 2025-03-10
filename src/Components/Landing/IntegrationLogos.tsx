import React from 'react';
import { motion } from 'framer-motion';

const bankLogos = [
  { name: 'Chase', color: '#117ACA' },
  { name: 'Bank of America', color: '#E11F3F' },
  { name: 'Wells Fargo', color: '#D71E28' },
  { name: 'Citibank', color: '#003B70' },
  { name: 'Capital One', color: '#004977' },
  { name: 'TD Bank', color: '#2D8B2A' },
];

interface IntegrationLogosProps {
  theme: 'dark' | 'light' | 'system';
}

export const IntegrationLogos: React.FC<IntegrationLogosProps> = ({ theme }) => {
  // Determine actual theme value if 'system' is provided
  const effectiveTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <div className={`py-16 ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-bold text-center mb-8 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Trusted by Leading Financial Institutions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {bankLogos.map((bank, index) => (
            <motion.div
              key={bank.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div
                className={`w-32 h-16 rounded-lg flex items-center justify-center text-white font-semibold ${
                  effectiveTheme === 'dark' ? 'shadow-lg shadow-blue-500/20' : 'shadow-md'
                }`}
                style={{ backgroundColor: bank.color }}
              >
                {bank.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 