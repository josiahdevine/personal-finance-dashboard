import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface IntegrationLogo {
  name: string;
  logo: string;
  url: string;
}

export const IntegrationLogos: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const logos: IntegrationLogo[] = [
    {
      name: 'Chase',
      logo: '/assets/logos/chase.svg',
      url: 'https://www.chase.com',
    },
    {
      name: 'Bank of America',
      logo: '/assets/logos/bank-of-america.svg',
      url: 'https://www.bankofamerica.com',
    },
    {
      name: 'Wells Fargo',
      logo: '/assets/logos/wells-fargo.svg',
      url: 'https://www.wellsfargo.com',
    },
    {
      name: 'Citibank',
      logo: '/assets/logos/citibank.svg',
      url: 'https://www.citibank.com',
    },
    {
      name: 'Capital One',
      logo: '/assets/logos/capital-one.svg',
      url: 'https://www.capitalone.com',
    },
    {
      name: 'TD Bank',
      logo: '/assets/logos/td-bank.svg',
      url: 'https://www.td.com',
    },
    {
      name: 'USAA',
      logo: '/assets/logos/usaa.svg',
      url: 'https://www.usaa.com',
    },
    {
      name: 'American Express',
      logo: '/assets/logos/amex.svg',
      url: 'https://www.americanexpress.com',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
    const target = e.target as HTMLImageElement;
    const parent = target.parentNode as HTMLElement;
    
    // Create a fallback div with the name
    const fallback = document.createElement('div');
    fallback.className = `h-full w-full flex items-center justify-center ${isDarkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100'} rounded-lg p-2 text-sm font-medium`;
    fallback.innerText = name;
    
    // Replace the image with the fallback
    parent.replaceChild(fallback, target);
  };

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seamlessly connect with over 10,000 financial institutions
          </h2>
          <p className={`mt-4 max-w-2xl mx-auto text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            We integrate with all major banks and financial services to give you a complete view of your finances.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {logos.map((item) => (
            <motion.a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center h-20 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors duration-300`}
              variants={itemVariants}
              aria-label={`View ${item.name} website`}
            >
              <img
                src={item.logo}
                alt={`${item.name} logo`}
                className="h-10 max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                onError={(e) => handleImageError(e, item.name)}
              />
            </motion.a>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            And thousands more through our Plaid and Yodlee integrations
          </p>
        </div>
      </div>
    </section>
  );
};
