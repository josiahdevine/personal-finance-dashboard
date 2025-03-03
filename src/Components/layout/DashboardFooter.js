import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for the dashboard
 * 
 * @component
 */
const DashboardFooter = () => {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  // Footer links
  const links = [
    { name: 'About', href: '/about' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help Center', href: '/help' },
  ];
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="mt-4 md:mt-0 md:order-1">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} Finance Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter; 