import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const BudgetPlanning: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Budget Planning
      </h1>
      {/* Budget planning content will go here */}
    </div>
  );
}; 