import React from 'react';
import { motion } from 'framer-motion';

interface Integration {
  id: number;
  name: string;
  logoLight: string;
  logoDark: string;
}

interface IntegrationLogosProps {
  theme: 'light' | 'dark';
}

/**
 * IntegrationLogos - Displays partner bank and financial service logos
 * 
 * Features:
 * - Responsive grid layout for different screen sizes
 * - Animation with staggered entrance
 * - Dark/light theme support with appropriate logos
 * - Proper accessibility attributes
 */
export const IntegrationLogos: React.FC<IntegrationLogosProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const integrations: Integration[] = [
    {
      id: 1,
      name: 'Chase Bank',
      logoLight: '/assets/logos/chase-light.svg',
      logoDark: '/assets/logos/chase-dark.svg'
    },
    {
      id: 2,
      name: 'Bank of America',
      logoLight: '/assets/logos/boa-light.svg',
      logoDark: '/assets/logos/boa-dark.svg'
    },
    {
      id: 3,
      name: 'Wells Fargo',
      logoLight: '/assets/logos/wellsfargo-light.svg',
      logoDark: '/assets/logos/wellsfargo-dark.svg'
    },
    {
      id: 4,
      name: 'Capital One',
      logoLight: '/assets/logos/capitalone-light.svg',
      logoDark: '/assets/logos/capitalone-dark.svg'
    },
    {
      id: 5,
      name: 'Citibank',
      logoLight: '/assets/logos/citi-light.svg',
      logoDark: '/assets/logos/citi-dark.svg'
    },
    {
      id: 6,
      name: 'Vanguard',
      logoLight: '/assets/logos/vanguard-light.svg',
      logoDark: '/assets/logos/vanguard-dark.svg'
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

  return (
    <section aria-labelledby="integrations-title">
      <h2 id="integrations-title" className="sr-only">Our Integration Partners</h2>
      
      <motion.div 
        className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {integrations.map((integration) => (
          <motion.div
            key={integration.id}
            variants={itemVariants}
            className="flex items-center justify-center h-16 w-32"
          >
            <img
              src={isDark ? integration.logoDark : integration.logoLight}
              alt={`${integration.name} logo`}
              className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity"
              height={64}
              width={128}
              loading="lazy"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
