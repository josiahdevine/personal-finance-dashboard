import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from "../../ui/button";
import { AuthSheet } from '../../auth/AuthSheet';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

/**
 * Hero - Landing page hero section with animated content
 * 
 * Features:
 * - Animated entrance effects
 * - Call-to-action buttons
 * - Responsive design
 * - Dark/light theme support
 * - Optional custom title and subtitle
 */
export const Hero: React.FC<HeroProps> = ({ 
  title = "Your Money. Reimagined.",
  subtitle = "Experience the future of personal finance with AI-powered insights and beautiful visualizations."
}) => {
  const { isDarkMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  return (
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
      
      <motion.div 
        className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          id="hero-heading"
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-center"
        >
          <span className="block">{title.split('.')[0]}</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            {title.split('.')[1] || 'Reimagined.'}
          </span>
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="mt-6 text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto text-center"
        >
          {subtitle}
        </motion.p>
        
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 items-center"
        >
          <AuthSheet defaultTab="register">
            <Button size="lg" className="px-8 h-12 text-lg">
              Get Started
            </Button>
          </AuthSheet>
          
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
      </motion.div>
    </section>
  );
};
