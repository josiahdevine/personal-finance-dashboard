import React from 'react';

interface DemoVideoProps {
  theme: 'light' | 'dark';
}

export const DemoVideo: React.FC<DemoVideoProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-12">
        <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          See how it works
        </h2>
        <p className={`mt-4 text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Watch our quick demo to see our dashboard in action
        </p>
      </div>
      
      <div className={`overflow-hidden rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="aspect-w-16 aspect-h-9 relative">
          {/* Placeholder for video - in production, you would use an actual video player */}
          <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="text-center">
              <div className={`h-20 w-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-white'} mx-auto flex items-center justify-center shadow-lg`}>
                <svg 
                  className={`h-12 w-12 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Click to play demo video
              </p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
          <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Our dashboard walkthrough
          </h3>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Learn how to connect your accounts, set up budgets, and use our AI-powered insights to optimize your finances.
          </p>
        </div>
      </div>
    </div>
  );
};
