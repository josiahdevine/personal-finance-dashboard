import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Testimonials } from './features/landing/Testimonials';
import { IntegrationLogos } from './features/landing/IntegrationLogos';
import { UnifiedDemo } from './features/landing/UnifiedDemo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { AuthSheet } from './auth/AuthSheet';
import { EnhancedSidebar } from './navigation/EnhancedSidebar';
import { EnhancedFooter } from './layout/EnhancedFooter';
import { EnhancedHeader } from './layout/EnhancedHeader';

export const LandingPageNew: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start', 'end']
  });
  
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const { isDarkMode } = useTheme();

  return (
    <div className="flex min-h-screen">
      {/* EnhancedSidebar */}
      <EnhancedSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col" ref={containerRef}>
        {/* Header */}
        <EnhancedHeader />
        
        {/* Main Content Area */}
        <div className={`flex-grow ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          {/* Hero Section */}
          <motion.div
            style={{ y }}
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0">
              <div className={`absolute inset-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800' 
                  : 'bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-600'
              } animate-gradient-x opacity-90`} />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto">
              <motion.h1
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
          </motion.div>

          {/* Features Section */}
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <UnifiedDemo />
            </div>
          </div>

          {/* Integration Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Seamlessly integrated with your favorite banks
                </h2>
              </motion.div>
              <IntegrationLogos theme={isDarkMode ? 'dark' : 'light'} />
            </div>
          </div>

          {/* Testimonials Section */}
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Testimonials theme={isDarkMode ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
        
        {/* Enhanced Footer */}
        <EnhancedFooter />
      </div>
    </div>
  );
};
