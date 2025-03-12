import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { AuthSheet } from './auth/AuthSheet';
import EnhancedSidebar from './navigation/EnhancedSidebar';
import { EnhancedFooter } from './layout/EnhancedFooter';

// Import consolidated landing page feature components
import { UnifiedDemo } from './features/landing/UnifiedDemo';
import { Testimonials } from './features/landing/Testimonials';
import { IntegrationLogos } from './features/landing/IntegrationLogos';

/**
 * LandingPage - The main landing page for the application
 * 
 * Features:
 * - Responsive design (mobile and desktop layouts)
 * - Enhanced header and footer
 * - Motion animations with Framer Motion
 * - Dark/light theme support
 * - Feature showcase in 2x2 grid
 * - Testimonials and integration logos sections
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // Scroll animation setup
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start', 'end']
  });
  
  const _y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* EnhancedSidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <EnhancedSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col" ref={containerRef}>
        {/* Custom Header - instead of EnhancedHeader which seems to have issues */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-2xl font-bold"
              >
                FinanceDash
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/features')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </Button>

              {/* Login */}
              <div className="ml-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span>Login</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className={`flex-grow w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} id="main-content">
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
                
                <Link to="/demo">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 h-12 text-lg bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section 
            aria-labelledby="features-heading" 
            className="w-full py-20 bg-white dark:bg-gray-900"
          >
            <div className="text-center mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                id="features-heading" 
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Powerful features for modern finance
              </h2>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <UnifiedDemo />
            </div>
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

export default LandingPage;
