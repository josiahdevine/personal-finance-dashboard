import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge } from '../ui';

/**
 * Header component for the dashboard
 * 
 * @component
 */
const DashboardHeader = ({ toggleSidebar }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Handle clicks outside the dropdown menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Example notifications
  const notifications = [
    {
      id: 1,
      title: 'Account Connected',
      description: 'Your Chase Bank account was successfully connected.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Budget Alert',
      description: 'You\'ve reached 80% of your dining budget this month.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'New Transaction',
      description: 'A new transaction was categorized as "Other". Please review.',
      time: '1 day ago',
      read: true,
    },
  ];
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center">
          {/* Menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo - visible on mobile when sidebar is closed */}
          <div className="ml-4 lg:hidden">
            <Link to="/" className="flex items-center">
              <img 
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Finance Dashboard"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900">Finance</span>
            </Link>
          </div>
          
          {/* Search bar */}
          <div className="max-w-lg w-full ml-4 hidden md:block">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm"
                placeholder="Search transactions, accounts..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Notifications dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <span className="sr-only">View notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {/* Badge showing unread count */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications panel */}
            {isNotificationsOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <a
                        key={notification.id}
                        href="#"
                        className={`block px-4 py-3 hover:bg-gray-50 ${
                          notification.read ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 flex items-center">
                              {notification.title}
                              {!notification.read && (
                                <Badge 
                                  variant="primary" 
                                  size="sm" 
                                  className="ml-2"
                                >
                                  New
                                </Badge>
                              )}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-gray-100">
                  <Link
                    to="/dashboard/notifications"
                    className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-1"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile dropdown */}
          <div className="ml-3 relative" ref={profileMenuRef}>
            <button
              type="button"
              className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                JD
              </div>
            </button>
            
            {/* Profile menu */}
            {isProfileMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  to="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <Link
                  to="/dashboard/support"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Support
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    // Add logout functionality here
                    console.log('Logout clicked');
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  /** Function to toggle the sidebar visibility */
  toggleSidebar: PropTypes.func.isRequired,
};

export default DashboardHeader; 