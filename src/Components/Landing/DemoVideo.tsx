import React from 'react';
import { motion } from 'framer-motion';

interface DemoVideoProps {
  theme: 'dark' | 'light';
}

export const DemoVideo: React.FC<DemoVideoProps> = ({ theme }) => {
  return (
    <div className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold sm:text-4xl mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            See how it works
          </h2>
          <p className={`text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Watch our quick demo to see the power of AI-driven financial management
          </p>
        </div>

        <div className={`relative rounded-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } aspect-video shadow-xl`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className={`mt-4 text-xl font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Click to watch demo
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 