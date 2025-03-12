import React from 'react';
import { EnhancedSidebar } from '../EnhancedSidebar';

// Preserving the original SidebarProps interface for backward compatibility
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

/**
 * @deprecated This component is deprecated. Please use EnhancedSidebar from "../EnhancedSidebar" instead.
 * This component will be removed in a future version.
 */
const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  className = '',
  user,
}) => {
  console.warn('Sidebar from src/components/navigation/sidebar/Sidebar.tsx is deprecated. Please use EnhancedSidebar from "../EnhancedSidebar" instead.');
  
  // Convert user prop to the shape expected by EnhancedSidebar
  const adaptedUser = user ? {
    id: user.email || 'unknown',
    email: user.email || '',
    name: user.name || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      theme: 'light' as 'light' | 'dark' | 'system',
      notifications: false,
      currency: 'USD'
    }
  } : null;

  return (
    <EnhancedSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      className={className}
      user={adaptedUser}
    />
  );
};

export default Sidebar;