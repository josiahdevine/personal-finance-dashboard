import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Landing/Header';
import { Hero } from '../../components/Landing/Hero';
import { Testimonials } from '../../components/Landing/Testimonials';
import { IntegrationLogos } from '../../components/Landing/IntegrationLogos';
import { DemoVideo } from '../../components/Landing/DemoVideo';
import { UnifiedDemo } from '../../components/Landing/UnifiedDemo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

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

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`} ref={containerRef}>
      <Header theme={theme} onThemeToggle={toggleTheme} />
      
      {/* Hero Section */}
      <Hero theme={theme} />

      {/* Features Section */}
      <div className={`relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl font-bold sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Powerful features for modern finance
            </h2>
          </motion.div>
          <UnifiedDemo />
        </div>
      </div>

      {/* Integration Section */}
      <div className={`relative ${theme === 'dark' ? 'bg-black' : 'bg-white'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl font-bold sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Seamlessly integrated with your favorite banks
            </h2>
          </motion.div>
          <IntegrationLogos theme={theme} />
        </div>
      </div>

      {/* Demo Video Section */}
      <div className={`relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoVideo theme={theme} />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={`relative ${theme === 'dark' ? 'bg-black' : 'bg-white'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials theme={theme} />
        </div>
      </div>
    </div>
  );
}; 