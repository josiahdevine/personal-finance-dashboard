import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/shadcn-avatar';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} id="testimonials">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            What Our Users Say
          </h2>
          <p className={`mt-4 text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of satisfied users who have transformed their financial lives
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg relative`}
              variants={item}
            >
              <div className="absolute top-4 right-4">
                <svg 
                  className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} opacity-20`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <div className="mb-4 mt-2">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {testimonial.content}
                </p>
              </div>
              
              <div className="flex items-center mt-4">
                <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                  {testimonial.avatar && <AvatarImage src={testimonial.avatar} alt={testimonial.author} />}
                  <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonial.author}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
