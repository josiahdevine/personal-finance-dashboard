import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Layout/Header';
import { Testimonials } from './Landing/Testimonials';
import { IntegrationLogos } from './Landing/IntegrationLogos';
import { DemoVideo } from './Landing/DemoVideo';
import { UnifiedDemo } from './Landing/UnifiedDemo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleMenuClick = () => {
    // No-op for landing page
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} ref={containerRef}>
      <Header theme={theme} onThemeToggle={toggleTheme} onMenuClick={handleMenuClick} />
      
      {/* Hero Section */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800' 
              : 'bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-600'
          } animate-gradient-x opacity-90`} />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white"
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
            className="mt-6 text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto"
          >
            Experience the future of personal finance with AI-powered insights
            and beautiful visualizations.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors duration-300"
            >
              Get Started
            </Link>
            <Link
              to="/features"
              className="rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-colors duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className={`relative ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-32`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UnifiedDemo />
        </div>
      </div>

      {/* Integration Section */}
      <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Seamlessly integrated with your favorite banks
            </h2>
          </motion.div>
          <IntegrationLogos theme={theme} />
        </div>
      </div>

      {/* Demo Video Section */}
      <div className={`relative ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoVideo theme={theme} />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials theme={theme} />
        </div>
      </div>
    </div>
  );
}; 