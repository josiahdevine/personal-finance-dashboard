import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Small Business Owner',
    content: 'This app has completely transformed how I manage my business finances. The AI insights are incredibly helpful.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    content: 'The integration with my bank accounts was seamless. I love how it automatically categorizes my transactions.',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Financial Advisor',
    content: 'I recommend this to all my clients. The budgeting tools and visualizations make financial planning so much easier.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

interface TestimonialsProps {
  theme: 'dark' | 'light' | 'system';
}

export const Testimonials: React.FC<TestimonialsProps> = ({ theme }) => {
  // Determine actual theme value if 'system' is provided
  const effectiveTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <div className={`py-24 ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold sm:text-4xl ${
            effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Trusted by professionals worldwide
          </h2>
          <p className={`mt-4 text-xl ${
            effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See what our users are saying about their experience
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-8 shadow-xl ${
                effectiveTheme === 'dark' 
                  ? 'bg-gray-800 shadow-blue-500/10' 
                  : 'bg-white shadow-gray-200/50'
              }`}
            >
              <div className="relative">
                <img
                  className="h-12 w-12 rounded-full ring-2 ring-blue-500"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="mt-4">
                  <blockquote>
                    <p className={`text-lg ${
                      effectiveTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {testimonial.content}
                    </p>
                  </blockquote>
                  <div className="mt-6">
                    <p className={`font-medium ${
                      effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-base ${
                      effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 