import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const AskAI: React.FC = () => {
  const { state } = useTheme();
  const isDark = state.theme === 'dark';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Ask AI
      </h1>
      {/* AI chat interface will go here */}
    </div>
  );
}; 