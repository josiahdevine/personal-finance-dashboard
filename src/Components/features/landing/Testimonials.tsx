import React from 'react';

interface TestimonialsProps {
  theme: 'light' | 'dark';
}

export const Testimonials: React.FC<TestimonialsProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const testimonials = [
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
      role: "Software Engineer",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      content: "The budget planning features have helped me save over $500 a month. Highly recommended!",
      author: "Michael Chen",
      role: "Marketing Director",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  return (
    <div>
      <h2 className={`text-center text-3xl font-bold mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        What Our Users Say
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id}
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-4xl text-indigo-500">"</span>
              </div>
              <div className="ml-4">
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="h-10 w-10 rounded-full mr-3" 
                  />
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.author}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
