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
 * @deprecated Use EnhancedSidebar component instead
 * This component is maintained for backward compatibility
 */
const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  className = '',
  user,
}) => {
  // Adapter for user object to match the EnhancedSidebar user type
  const adaptedUser = user ? {
    uid: user.email || 'unknown',
    email: user.email || null,
    displayName: user.name || null,
    photoURL: user.avatar || null,
    emailVerified: false,
    phoneNumber: null,
    role: user.role
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