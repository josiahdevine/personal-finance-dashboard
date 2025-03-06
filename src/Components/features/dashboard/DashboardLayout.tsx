import React from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { useAppContext } from '../../../contexts/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { state, dispatch } = useAppContext();
  const { isSidebarOpen, theme } = state.ui;

  const toggleSidebar = () => {
    dispatch({ type: 'UI_SET_SIDEBAR_OPEN', payload: !isSidebarOpen });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 p-6 transition-all duration-200 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}; 