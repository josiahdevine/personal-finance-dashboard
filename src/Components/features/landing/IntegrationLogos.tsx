import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

interface Integration {
  id: number;
  name: string;
  logoLight: string;
  logoDark: string;
  url: string;
}

/**
 * IntegrationLogos - Displays partner bank and financial service logos
 * 
 * Features:
 * - Responsive horizontal scrolling layout for mobile
 * - Grid layout for desktop
 * - Animation with staggered entrance
 * - Dark/light theme support for logos
 * - Proper image fallbacks
 * - Accessible with proper aria labels
 */
export const IntegrationLogos: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const integrations: Integration[] = [
    {
      id: 1,
      name: 'Chase Bank',
      logoLight: '/assets/logos/chase-light.svg',
      logoDark: '/assets/logos/chase-dark.svg',
      url: 'https://www.chase.com'
    },
    {
      id: 2,
      name: 'Bank of America',
      logoLight: '/assets/logos/boa-light.svg',
      logoDark: '/assets/logos/boa-dark.svg',
      url: 'https://www.bankofamerica.com'
    },
    {
      id: 3,
      name: 'Wells Fargo',
      logoLight: '/assets/logos/wellsfargo-light.svg',
      logoDark: '/assets/logos/wellsfargo-dark.svg',
      url: 'https://www.wellsfargo.com'
    },
    {
      id: 4,
      name: 'Capital One',
      logoLight: '/assets/logos/capitalone-light.svg',
      logoDark: '/assets/logos/capitalone-dark.svg',
      url: 'https://www.capitalone.com'
    },
    {
      id: 5,
      name: 'Citibank',
      logoLight: '/assets/logos/citi-light.svg',
      logoDark: '/assets/logos/citi-dark.svg',
      url: 'https://www.citibank.com'
    },
    {
      id: 6,
      name: 'Vanguard',
      logoLight: '/assets/logos/vanguard-light.svg',
      logoDark: '/assets/logos/vanguard-dark.svg',
      url: 'https://www.vanguard.com'
    },
    {
      id: 7,
      name: 'American Express',
      logoLight: '/assets/logos/amex-light.svg',
      logoDark: '/assets/logos/amex-dark.svg',
      url: 'https://www.americanexpress.com'
    },
    {
      id: 8,
      name: 'TD Bank',
      logoLight: '/assets/logos/tdbank-light.svg',
      logoDark: '/assets/logos/tdbank-dark.svg',
      url: 'https://www.td.com'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
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
    <section 
      aria-labelledby="integrations-title"
      className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 
          id="integrations-title" 
          className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white"
        >
          Seamlessly connect with thousands of financial institutions
        </h2>
        
        {/* Mobile Scrollable Row */}
        <div className="md:hidden overflow-x-auto pb-8">
          <motion.div 
            className="flex space-x-6 min-w-max px-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {integrations.map((integration) => (
              <motion.a
                key={integration.id}
                href={integration.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                className="flex items-center justify-center h-16 w-32 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
                aria-label={`${integration.name} website`}
              >
                <img
                  src={isDarkMode ? integration.logoDark : integration.logoLight}
                  alt={`${integration.name} logo`}
                  className="max-h-12 max-w-[80%] object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  height={48}
                  width={100}
                  loading="lazy"
                  onError={(e) => handleImageError(e, integration.name)}
                />
              </motion.a>
            ))}
          </motion.div>
        </div>
        
        {/* Desktop Grid */}
        <motion.div 
          className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {integrations.map((integration) => (
            <motion.a
              key={integration.id}
              href={integration.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              className="flex items-center justify-center h-20 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label={`${integration.name} website`}
            >
              <img
                src={isDarkMode ? integration.logoDark : integration.logoLight}
                alt={`${integration.name} logo`}
                className="max-h-12 max-w-[80%] object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                height={48}
                width={100}
                loading="lazy"
                onError={(e) => handleImageError(e, integration.name)}
              />
            </motion.a>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            And thousands more through our Plaid and Yodlee integrations
          </p>
        </div>
      </div>
    </section>
  );
};
