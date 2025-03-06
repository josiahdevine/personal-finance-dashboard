import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroProps {
  theme: 'dark' | 'light';
}

export const Hero: React.FC<HeroProps> = ({ theme }) => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className={`relative h-screen flex items-center justify-center overflow-hidden ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-b from-indigo-50 to-white text-gray-900'
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {theme === 'dark' && (
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.h1
          variants={itemVariants}
          className={`text-6xl md:text-8xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Your Money.
          <br />
          <span className={`bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-blue-400 to-purple-600'
              : 'from-indigo-600 to-blue-500'
          } text-transparent bg-clip-text`}>
            Reimagined.
          </span>
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className={`mt-6 text-xl md:text-2xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          } max-w-3xl mx-auto`}
        >
          Experience the future of personal finance with AI-powered insights
          and beautiful visualizations.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex justify-center gap-6"
        >
          <Link
            to="/register"
            className={`rounded-full px-8 py-4 text-lg font-semibold shadow-lg transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            Get Started
          </Link>
          <Link
            to="/features"
            className={`rounded-full px-8 py-4 text-lg font-semibold transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}; 