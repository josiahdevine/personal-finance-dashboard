import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedSidebar from '../navigation/EnhancedSidebar';

// Define interface for Sidebar props
export type SidebarProps = {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  mobileOnly?: boolean;  
  desktopOnly?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  user?: any; // Using any temporarily to avoid type conflicts
};

/**
 * @deprecated This component is deprecated. Please use EnhancedSidebar from "../navigation/EnhancedSidebar" instead.
 * This component will be removed in a future version.
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  className = "", 
  isOpen: _isOpen = false,
  onClose: _onClose = () => {/* No operation - optional callback */},
  mobileOnly = false,
  desktopOnly: _desktopOnly = false,
  collapsed = false,
  onToggle,
  user
}) => {
  console.warn('Sidebar from src/components/layout/Sidebar.tsx is deprecated. Please use EnhancedSidebar from "../navigation/EnhancedSidebar" instead.');
  
  const { currentUser } = useAuth();

  // Use the EnhancedSidebar internally
  return (
    <EnhancedSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      className={className}
      user={user || currentUser}
      mobile={mobileOnly}
    />
  );
};

export default Sidebar;