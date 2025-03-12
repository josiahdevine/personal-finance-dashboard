import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/ui/navigation-menu";
import { cn } from "../../lib/utils";
import {
  RiTwitterXFill,
  RiLinkedinFill,
  RiFacebookFill,
  RiGithubFill,
  RiInstagramLine
} from 'react-icons/ri';
import { BaseComponentProps } from '../../types/components';

interface FooterLink {
  title: string;
  href: string;
  description?: string;
}

interface EnhancedFooterProps extends BaseComponentProps {
  className?: string;
}

export const EnhancedFooter: React.FC<EnhancedFooterProps> = ({ className }) => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const companyLinks: FooterLink[] = [
    { title: "About", href: "/about", description: "Learn about our mission and values." },
    { title: "Blog", href: "/blog", description: "Latest news, updates, and financial insights." },
    { title: "Careers", href: "/careers", description: "Join our team of passionate builders." },
    { title: "Press", href: "/press", description: "Press releases and media resources." }
  ];

  const resourceLinks: FooterLink[] = [
    { title: "Features", href: "/features", description: "Discover all our powerful features." },
    { title: "Pricing", href: "/pricing", description: "Flexible plans for every financial need." },
    { title: "Security", href: "/security", description: "How we keep your data safe and secure." },
    { title: "Roadmap", href: "/roadmap", description: "See what's coming next in our development." }
  ];

  const supportLinks: FooterLink[] = [
    { title: "Help Center", href: "/help", description: "Answers to common questions." },
    { title: "Contact Us", href: "/contact", description: "Get in touch with our support team." },
    { title: "FAQ", href: "/faq", description: "Frequently asked questions." },
    { title: "Status", href: "/status", description: "Check our system status." }
  ];

  const legalLinks: FooterLink[] = [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Cookie Policy", href: "/cookies" },
    { title: "GDPR", href: "/gdpr" }
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/financedash',
      icon: <RiTwitterXFill className="w-4 h-4" />,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/financedash',
      icon: <RiLinkedinFill className="w-4 h-4" />,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/company/financedash',
      icon: <RiFacebookFill className="w-4 h-4" />,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/financedash',
      icon: <RiGithubFill className="w-4 h-4" />,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/financedash',
      icon: <RiInstagramLine className="w-4 h-4" />,
    },
  ];

  return (
    <footer className={cn(
      `${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`,
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row justify-between mb-8">
          {/* Logo and Social */}
          <div className="mb-8 lg:mb-0">
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FinanceDash
              </span>
            </Link>
            <p className={`mt-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Making personal finance management simple and smart.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="lg:w-2/3">
            <NavigationMenu>
              <NavigationMenuList className="flex-col sm:flex-row gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={isDarkMode ? 'text-white' : ''}>Company</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {companyLinks.map((link) => (
                        <ListItem
                          key={link.title}
                          title={link.title}
                          href={link.href}
                          isDarkMode={isDarkMode}
                        >
                          {link.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={isDarkMode ? 'text-white' : ''}>Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {resourceLinks.map((link) => (
                        <ListItem
                          key={link.title}
                          title={link.title}
                          href={link.href}
                          isDarkMode={isDarkMode}
                        >
                          {link.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={isDarkMode ? 'text-white' : ''}>Support</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {supportLinks.map((link) => (
                        <ListItem
                          key={link.title}
                          title={link.title}
                          href={link.href}
                          isDarkMode={isDarkMode}
                        >
                          {link.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={isDarkMode ? 'text-white' : ''}>Legal</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {legalLinks.map((link) => (
                        <ListItem
                          key={link.title}
                          title={link.title}
                          href={link.href}
                          isDarkMode={isDarkMode}
                        >
                          {link.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Copyright and Back to Top */}
        <div className={`pt-6 mt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col sm:flex-row justify-between items-center`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; {currentYear} FinanceDash, Inc. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`mt-4 sm:mt-0 text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'} transition-colors flex items-center gap-1`}
            aria-label="Scroll to top"
          >
            <span>Back to top</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

// Component for navigation menu items
interface ListItemProps {
  className?: string;
  title: string;
  href: string;
  isDarkMode?: boolean;
  children?: React.ReactNode;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, href, isDarkMode, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            to={href}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              isDarkMode ? "text-white hover:bg-gray-800" : "text-gray-900 hover:bg-gray-100",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            {children && (
              <p className={`line-clamp-2 text-sm leading-snug ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {children}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
