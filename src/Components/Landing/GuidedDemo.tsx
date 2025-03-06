import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  credentials?: {
    email: string;
    password: string;
  };
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: 'Personal Account Demo',
    description: 'Experience the dashboard from an individual user perspective. Track personal expenses, savings, and investments.',
    credentials: {
      email: 'demo.user@example.com',
      password: 'demo123',
    },
  },
  {
    id: 2,
    title: 'Small Business Demo',
    description: 'See how small business owners can manage their business finances and track cash flow.',
    credentials: {
      email: 'business.demo@example.com',
      password: 'business123',
    },
  },
  {
    id: 3,
    title: 'Investment Portfolio Demo',
    description: 'Explore advanced investment tracking features and portfolio analysis tools.',
    credentials: {
      email: 'investor.demo@example.com',
      password: 'invest123',
    },
  },
];

export const GuidedDemo: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<DemoStep | null>(null);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCopy = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
            Try it yourself
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Interactive Demo Accounts
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Choose a demo account to explore different features and use cases
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {demoSteps.map((step) => (
            <motion.div
              key={step.id}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
                <button
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setSelectedStep(step)}
                >
                  View Credentials
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <motion.div
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedStep.title} Credentials
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Email:</span>
                          <div className="flex items-center">
                            <span className="text-sm font-mono mr-2">
                              {selectedStep.credentials?.email}
                            </span>
                            <button
                              onClick={() => handleCopy(selectedStep.credentials?.email || '', 'email')}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              {copied === 'email' ? (
                                <span className="text-green-500">Copied!</span>
                              ) : (
                                'Copy'
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Password:</span>
                          <div className="flex items-center">
                            <span className="text-sm font-mono mr-2">
                              {selectedStep.credentials?.password}
                            </span>
                            <button
                              onClick={() => handleCopy(selectedStep.credentials?.password || '', 'password')}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              {copied === 'password' ? (
                                <span className="text-green-500">Copied!</span>
                              ) : (
                                'Copy'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    onClick={() => setSelectedStep(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 