import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon,
  CogIcon,
  BanknotesIcon,
  ArrowLeftOnRectangleIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCardIcon },
  { name: 'Salary Journal', href: '/dashboard/salary', icon: BanknotesIcon },
  { name: 'Bills & Subscriptions', href: '/dashboard/bills', icon: ClipboardDocumentListIcon },
  { name: 'Budget Planning', href: '/dashboard/budget', icon: CalculatorIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Cash Flow', href: '/dashboard/cash-flow', icon: ChartPieIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Ask AI', href: '/dashboard/ai', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarClasses = `
    ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    fixed inset-y-0 left-0 w-64 shadow-xl transition-transform duration-300 ease-in-out
    md:translate-x-0 z-30
  `;

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-20
    md:hidden
    ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    transition-opacity duration-300 ease-in-out
  `;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      <div className={overlayClasses} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white">
                FinanceDash
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group relative flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-900 bg-opacity-20'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-y-0 left-0 w-1 bg-indigo-400 rounded-r-md"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`flex-shrink-0 p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user?.display_name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium truncate max-w-[120px] ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {user?.display_name || user?.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className={`text-xs font-medium flex items-center mt-1 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 