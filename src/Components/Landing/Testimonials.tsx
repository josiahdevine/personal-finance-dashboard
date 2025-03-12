import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { DisplayMode } from '../../types/enums';

interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  rating: number;
}

export const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme.mode === DisplayMode.DARK;
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      content: "FinanceDash has completely transformed how I manage my finances. The AI insights help me save money I didn't even know I was wasting.",
      author: {
        name: 'Sarah Johnson',
        title: 'Small Business Owner',
        image: '/assets/testimonials/sarah.jpg',
      },
      rating: 5,
    },
    {
      id: '2',
      content: "The budget forecasting feature has helped me plan for big expenses and avoid surprise bills. I've never felt more in control of my money.",
      author: {
        name: 'Michael Chen',
        title: 'Software Engineer',
        image: '/assets/testimonials/michael.jpg',
      },
      rating: 5,
    },
    {
      id: '3',
      content: "I used to spend hours tracking my expenses across multiple apps. Now everything is in one place, and I can see my financial health at a glance.",
      author: {
        name: 'Olivia Rodriguez',
        title: 'Marketing Director',
        image: '/assets/testimonials/olivia.jpg',
      },
      rating: 4,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
            What Our Users Say
          </h2>
          <p className={`mt-4 max-w-2xl mx-auto text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Don't just take our word for it. See how FinanceDash is helping people take control of their finances.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-12 z-10 hidden md:block">
            <button
              onClick={handlePrev}
              className={`rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-12 z-10 hidden md:block">
            <button
              onClick={handleNext}
              className={`rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Testimonial cards */}
          <div className="overflow-hidden">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className={`${
                    index === activeIndex ? 'block' : 'hidden'
                  } p-8 rounded-2xl ${
                    isDarkMode 
                      ? 'bg-gray-800 shadow-xl' 
                      : 'bg-white shadow-xl'
                  }`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <blockquote>
                    <p className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      "{testimonial.content}"
                    </p>
                    <footer className="mt-8 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-300">
                          <img
                            src={testimonial.author.image}
                            alt={`${testimonial.author.name}`}
                            onError={(e) => {
                              // If image fails to load, show initials
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentNode as HTMLElement;
                              const initials = testimonial.author.name
                                .split(' ')
                                .map(n => n[0])
                                .join('');
                              
                              parent.innerHTML = `<div class="h-12 w-12 flex items-center justify-center text-white bg-blue-500 rounded-full">${initials}</div>`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {testimonial.author.name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {testimonial.author.title}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="flex justify-between mt-8 md:hidden">
            <button
              onClick={handlePrev}
              className={`rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className={`rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`mx-1 w-3 h-3 rounded-full focus:outline-none ${
                  index === activeIndex
                    ? 'bg-blue-600'
                    : isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
