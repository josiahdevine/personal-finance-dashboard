import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  QuestionMarkCircleIcon, 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ChartBarIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CurrencyDollarIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import { log, logError } from '../../utils/logger';
import { HiMenu, HiX, HiOutlineLogout, HiOutlineHome, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineLink, HiOutlineChartBar } from '../../utils/iconMapping';
import { Button } from '../ui';

const AuthenticatedHeader = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', path: '/transactions', icon: BanknotesIcon },
    { name: 'Goals', path: '/goals', icon: ChartBarIcon },
    { name: 'Reports', path: '/reports', icon: DocumentTextIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      logError('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
              ariaLabel="Toggle mobile menu"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Button>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-800" aria-label="Go to dashboard">
                FinanceFlow
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4" role="menubar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
              ariaLabel="Logout"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              ariaLabel="Toggle mobile menu"
              ariaExpanded={isOpen}
            >
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" role="menu" aria-label="Mobile navigation">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              ariaLabel="Logout"
            >
              <div className="flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Logout
              </div>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AuthenticatedHeader; 