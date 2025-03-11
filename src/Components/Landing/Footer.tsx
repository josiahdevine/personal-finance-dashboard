import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { 
  RiTwitterXFill, 
  RiLinkedinFill, 
  RiFacebookFill, 
  RiGithubFill,
  RiInstagramLine
} from 'react-icons/ri';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
    social: [
      {
        name: 'Twitter',
        href: 'https://twitter.com/financedash',
        icon: <RiTwitterXFill className="w-5 h-5" />,
      },
      {
        name: 'LinkedIn',
        href: 'https://linkedin.com/company/financedash',
        icon: <RiLinkedinFill className="w-5 h-5" />,
      },
      {
        name: 'Facebook',
        href: 'https://facebook.com/financedash',
        icon: <RiFacebookFill className="w-5 h-5" />,
      },
      {
        name: 'GitHub',
        href: 'https://github.com/financedash',
        icon: <RiGithubFill className="w-5 h-5" />,
      },
      {
        name: 'Instagram',
        href: 'https://instagram.com/financedash',
        icon: <RiInstagramLine className="w-5 h-5" />,
      },
    ],
  };

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FinanceDash
              </span>
            </Link>
            <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Making personal finance management simple, smart, and secure for everyone.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-500'} tracking-wider uppercase`}>
                  Product
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`text-base ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-500'} tracking-wider uppercase`}>
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`text-base ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-500'} tracking-wider uppercase`}>
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`text-base ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-500'} tracking-wider uppercase`}>
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`text-base ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-center`}>
          <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; {currentYear} FinanceDash, Inc. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'} flex items-center`}
              aria-label="Scroll to top"
            >
              <span>Back to top</span>
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
