import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const AskAI: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Ask AI
      </h1>
      {/* AI chat interface will go here */}
    </div>
  );
}; 