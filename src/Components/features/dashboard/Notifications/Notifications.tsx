import React from 'react';

const Notifications: React.FC = () => {
  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Budget Alert',
      message: 'Your dining budget is at 95% of the limit',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Feature Available',
      message: 'Try our new budget planning tools for better financial insights',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Payment Confirmed',
      message: 'Your credit card payment has been processed successfully',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'alert',
      title: 'Unusual Activity',
      message: 'We detected a large transaction on your account',
      time: '3 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'info',
      title: 'Account Linked',
      message: 'Your Bank of America account has been linked successfully',
      time: '5 days ago',
      read: true,
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md">
            Mark all as read
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md">
            Settings
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex p-4">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400">
              All
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Unread
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Alerts
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'alert' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                  )}
                  {notification.type === 'info' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                  {notification.type === 'success' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.time}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
          Load more
        </button>
      </div>
    </div>
  );
};

export default Notifications;
