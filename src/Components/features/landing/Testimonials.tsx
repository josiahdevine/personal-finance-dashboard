import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  avatar: string;
}

interface TestimonialsProps {
  theme: 'light' | 'dark';
}

/**
 * Testimonials - Displays customer testimonials with animations
 * 
 * Features:
 * - Responsive design for different screen sizes
 * - Animation with staggered children
 * - Accessibility features with proper ARIA attributes
 * - Dark/light theme support
 */
export const Testimonials: React.FC<TestimonialsProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: "This app has completely transformed how I manage my finances. The AI insights are incredibly helpful!",
      author: "Alex Johnson",
      role: "Small Business Owner",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      content: "I've tried many finance tools, but this one stands out. Beautiful visualizations and intuitive interface.",
      author: "Sarah Miller",
      role: "Financial Analyst",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      content: "The automated budgeting features have helped me save an extra $300 every month. Absolutely love it!",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="sr-only">Customer Testimonials</h2>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={itemVariants}
            className={`p-6 rounded-xl shadow-lg ${
              isDark 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <svg 
                  className={`h-8 w-8 mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className={`text-lg mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  "{testimonial.content}"
                </p>
              </div>
              <div className="flex items-center mt-4">
                <img
                  className="h-10 w-10 rounded-full mr-3"
                  src={testimonial.avatar}
                  alt={`${testimonial.author}'s avatar`}
                  loading="lazy"
                />
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
