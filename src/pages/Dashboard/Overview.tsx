import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardApplet {
  title: string;
  route: string;
  icon: React.ForwardRefExoticComponent<any>;
  content: React.ReactNode;
}

export const Overview: React.FC = () => {
  const navigate = useNavigate();

  const applets: DashboardApplet[] = [
    {
      title: 'Recent Transactions',
      route: '/dashboard/transactions',
      icon: CreditCardIcon,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Netflix Subscription</span>
            <span className="text-red-500">-$15.99</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Salary Deposit</span>
            <span className="text-green-500">+$3,500.00</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Grocery Store</span>
            <span className="text-red-500">-$84.32</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Salary Overview',
      route: '/dashboard/salary',
      icon: BanknotesIcon,
      content: (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Monthly Net:</span>
            <span className="text-sm font-medium">$4,200.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">YTD Total:</span>
            <span className="text-sm font-medium">$50,400.00</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-indigo-600 rounded-full w-3/4"></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Upcoming Bills',
      route: '/dashboard/bills',
      icon: ClipboardDocumentListIcon,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Rent</span>
            <span className="text-red-500">$1,800.00</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Internet</span>
            <span className="text-red-500">$79.99</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Phone Bill</span>
            <span className="text-red-500">$45.00</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Monthly Analytics',
      route: '/dashboard/analytics',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Spending:</span>
            <span className="text-sm font-medium text-red-500">-$2,845.33</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Income:</span>
            <span className="text-sm font-medium text-green-500">+$4,200.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Savings:</span>
            <span className="text-sm font-medium text-indigo-500">$1,354.67</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {applets.map((applet) => (
              <div
                key={applet.title}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div 
                  className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(applet.route)}
                >
                  <div className="flex items-center">
                    <applet.icon className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">{applet.title}</h3>
                  </div>
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="px-4 py-5 sm:p-6">{applet.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 