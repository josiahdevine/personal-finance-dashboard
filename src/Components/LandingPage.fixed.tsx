import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { AuthSheet } from './auth/AuthSheet';
import EnhancedSidebar from './navigation/EnhancedSidebar';
import { EnhancedFooter } from './layout/EnhancedFooter';
import { EnhancedHeader } from './layout/EnhancedHeader';

// Import consolidated landing page feature components
import { UnifiedDemo } from './features/landing/UnifiedDemo';
import { Testimonials } from './features/landing/Testimonials';
import { IntegrationLogos } from './features/landing/IntegrationLogos';

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the LandingPage component from 'src/components/LandingPage.tsx' instead.
 * 
 * LandingPage - The main landing page for the application
 * 
 * Features:
 * - Responsive design (mobile and desktop layouts)
 * - AnimatedSidebar integration
 * - Enhanced header and footer
 * - Motion animations with Framer Motion
 * - Dark/light theme support
 * - Feature showcase in 2x2 grid
 * - Testimonials and integration logos sections
 */
export const LandingPage: React.FC = () => {
  // Scroll animation setup
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start', 'end']
  });
  
  const _y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* EnhancedSidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <EnhancedSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col" ref={containerRef}>
        {/* Header */}
        <EnhancedHeader 
          theme={isDarkMode ? 'dark' : 'light'} 
          onThemeToggle={toggleTheme} 
        />
        
        {/* Main Content Area */}
        <main className={`flex-grow ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} id="main-content">
          {/* Hero Section */}
          <section 
            aria-labelledby="hero-heading" 
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0">
              <div 
                className={`absolute inset-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800' 
                    : 'bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-600'
                } animate-gradient-x opacity-90`} 
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            </div>
            
            <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto">
              <motion.h1
                id="hero-heading"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-center"
              >
                Your Money.
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                  Reimagined.
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto text-center"
              >
                Experience the future of personal finance with AI-powered insights
                and beautiful visualizations.
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 items-center"
              >
                <AuthSheet defaultTab="register">
                  <Button size="lg" className="px-8 h-12 text-lg">
                    Get Started
                  </Button>
                </AuthSheet>
                
                <Separator className="hidden sm:block h-8 w-px bg-white/20" orientation="vertical" />
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 h-12 text-lg bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                  asChild
                >
                  <Link to="/interactive-demo">
                    Learn More
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section 
            aria-labelledby="features-heading" 
            className="w-full py-20 bg-white dark:bg-gray-900"
          >
            <div className="text-center mb-8">
              <h2 
                id="features-heading" 
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Powerful features for modern finance
              </h2>
            </div>
            <UnifiedDemo />
          </section>

          {/* Integration Section */}
          <section 
            aria-labelledby="integrations-heading" 
            className="w-full py-20 bg-gray-100 dark:bg-gray-800"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 
                  id="integrations-heading"
                  className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  Seamlessly integrated with your favorite banks
                </h2>
              </motion.div>
              <IntegrationLogos />
            </div>
          </section>

          {/* Testimonials Section */}
          <section 
            aria-labelledby="testimonials-heading" 
            className="w-full py-20 bg-white dark:bg-gray-900"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 
                id="testimonials-heading" 
                className="sr-only"
              >
                Customer Testimonials
              </h2>
              <Testimonials />
            </div>
          </section>
        </main>
        
        {/* Enhanced Footer */}
        <EnhancedFooter />
      </div>
    </div>
  );
};
