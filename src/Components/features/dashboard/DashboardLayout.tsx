import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { state, toggleSidebar } = useAppContext();
  
  // Use state properties directly
  const theme = state.theme;
  const isSidebarOpen = state.sidebarOpen;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex">
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="h-screen bg-gray-100 dark:bg-gray-800 p-4">
            {/* Sidebar content */}
            <h2 className="text-xl font-bold mb-6">Dashboard</h2>
            <nav className="space-y-2">
              <a href="/dashboard" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Home</a>
              <a href="/accounts" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Accounts</a>
              <a href="/transactions" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Transactions</a>
              <a href="/budgets" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Budgets</a>
              <a href="/analytics" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Analytics</a>
            </nav>
          </div>
        </aside>
        <main className={`flex-1 p-6 transition-all duration-300`}>
          <header className="mb-6 flex justify-between items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div>{/* User menu */}</div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}; 