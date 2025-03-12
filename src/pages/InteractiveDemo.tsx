import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { DemoVideo } from '../components/features/landing/DemoVideo';
import { UnifiedDemo } from '../components/features/landing/UnifiedDemo';
import { Testimonials } from '../components/features/landing/Testimonials';
import { IntegrationLogos } from '../components/Landing/IntegrationLogos';
import { Separator } from '../components/ui/separator';
import { EnhancedFooter } from '../components/layout/EnhancedFooter';

export const InteractiveDemo: React.FC = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? 'dark' : 'light';
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center mb-12">
          Interactive Demo
        </h1>
        
        <Separator className="my-8" />
        
        {/* Demo Video Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6 text-center">See How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <DemoVideo theme={theme} />
          </div>
        </section>
        
        <Separator className="my-8" />
        
        {/* Charts and Visualizations */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6 text-center">Powerful Visualizations</h2>
          <div className="max-w-6xl mx-auto">
            <UnifiedDemo />
          </div>
        </section>
        
        <Separator className="my-8" />
        
        {/* Integration Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6 text-center">Seamless Integrations</h2>
          <div className="max-w-5xl mx-auto">
            <IntegrationLogos />
          </div>
        </section>
        
        <Separator className="my-8" />
        
        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">What Our Users Say</h2>
          <div className="max-w-6xl mx-auto">
            <Testimonials />
          </div>
        </section>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default InteractiveDemo;
