import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const Analytics: React.FC = () => {
  const { state } = useTheme();
  const isDark = state.theme === 'dark';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Analytics
      </h1>
      {/* Analytics content will go here */}
    </div>
  );
}; 