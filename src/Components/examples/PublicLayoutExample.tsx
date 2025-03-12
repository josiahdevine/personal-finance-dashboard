import React from 'react';
import PublicLayout from '../layout/PublicLayout';

/**
 * Example component demonstrating the use of PublicLayout
 * This shows how to use the PublicLayout component for public/marketing pages
 */
export const PublicLayoutExample: React.FC = () => {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Our Platform</h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-6">
            This is an example of a public page using the PublicLayout component.
            It includes the PublicNavbar at the top and EnhancedFooter at the bottom.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 1</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 2</h3>
              <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 3</h3>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicLayoutExample; 