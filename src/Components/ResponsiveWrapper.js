import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * A wrapper component that handles responsive layout switching between desktop and mobile views
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.desktopLayout - The desktop layout component to use
 * @param {React.ReactNode} props.children - The content to render
 */
const ResponsiveWrapper = ({ desktopLayout: DesktopLayout, children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after mount to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // On mobile, render children directly
  if (isMobile) {
    return <>{children}</>;
  }

  // On desktop, wrap children in desktop layout
  return <DesktopLayout>{children}</DesktopLayout>;
};

export default ResponsiveWrapper; 