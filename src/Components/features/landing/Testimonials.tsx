import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { TestimonialCard } from '../../marketing/TestimonialCard';

interface Testimonial {
  content: string;
  author: string;
  role: string;
  avatar?: string;
}

/**
 * Testimonials - Displays customer testimonials with animations
 * 
 * Features:
 * - Responsive design for different screen sizes
 * - Animation with staggered children
 * - Uses shared TestimonialCard component
 * - Accessibility features with proper ARIA attributes
 * - Dark/light theme support
 */
export const Testimonials: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const testimonials: Testimonial[] = [
    {
      content: "FinanceDash has completely transformed how I manage my finances. The AI insights are incredibly accurate and helpful.",
      author: "Sarah Johnson",
      role: "Small Business Owner",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      content: "The budget planning tools are intuitive and have helped me save an extra $500 per month. Highly recommended!",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      content: "I've tried many finance apps, but this one stands out with its beautiful visualizations and powerful analytics.",
      author: "Emma Rodriguez",
      role: "Marketing Director",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      content: "The cash flow predictions have been a game-changer for my freelance business. I can now plan months ahead with confidence.",
      author: "David Kim",
      role: "Freelance Designer",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            What our customers are saying
          </h2>
          <p className={`mt-4 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Thousands of professionals trust FinanceDash to manage their finances
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <TestimonialCard
                quote={testimonial.content}
                name={testimonial.author}
                title={testimonial.role}
                avatarUrl={testimonial.avatar || ''}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
