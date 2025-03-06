import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const Settings: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Settings
      </h1>
      {/* Settings content will go here */}
    </div>
  );
}; 