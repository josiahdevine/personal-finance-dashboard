import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Twitter, Facebook, Instagram, Github } from 'lucide-react';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ 
  href, 
  children,
  className
}) => (
  <li className={cn("transition-transform hover:-translate-y-1", className)}>
    <Link 
      to={href} 
      className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
      aria-label={typeof children === 'string' ? children : undefined}
      tabIndex={0}
    >
      {children}
    </Link>
  </li>
);

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn(
      "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800",
      className
    )}>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/team">Team</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/demo">Demo</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/guides">Guides</FooterLink>
              <FooterLink href="/support">Support</FooterLink>
              <FooterLink href="/api">API</FooterLink>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <Link 
              to="/" 
              className="text-xl font-bold text-primary"
              aria-label="FinanceDash Home"
              tabIndex={0}
            >
              FinanceDash
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} FinanceDash. All rights reserved.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Twitter"
              tabIndex={0}
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Facebook"
              tabIndex={0}
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Instagram"
              tabIndex={0}
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="GitHub"
              tabIndex={0}
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 