import React from 'react';

interface IntegrationLogosProps {
  theme: 'light' | 'dark';
}

export const IntegrationLogos: React.FC<IntegrationLogosProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const logoStyle = isDark ? 'opacity-70 hover:opacity-100' : 'opacity-60 hover:opacity-100';
  
  // Define banking and financial services logos
  const logos = [
    { id: 1, name: 'Bank of America', logo: 'https://logo.clearbit.com/bankofamerica.com' },
    { id: 2, name: 'Chase', logo: 'https://logo.clearbit.com/chase.com' },
    { id: 3, name: 'Wells Fargo', logo: 'https://logo.clearbit.com/wellsfargo.com' },
    { id: 4, name: 'Citibank', logo: 'https://logo.clearbit.com/citibank.com' },
    { id: 5, name: 'Capital One', logo: 'https://logo.clearbit.com/capitalone.com' },
    { id: 6, name: 'American Express', logo: 'https://logo.clearbit.com/americanexpress.com' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
        {logos.map((item) => (
          <div 
            key={item.id} 
            className={`col-span-1 flex justify-center py-8 px-8 ${logoStyle} transition-opacity duration-300`}
          >
            <img
              className="max-h-12"
              src={item.logo}
              alt={item.name}
            />
          </div>
        ))}
      </div>
      <p className={`text-center mt-8 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        And 1000+ more financial institutions worldwide
      </p>
    </div>
  );
};
