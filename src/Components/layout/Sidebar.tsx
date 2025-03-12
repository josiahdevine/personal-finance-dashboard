import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { EnhancedSidebar } from '../navigation/EnhancedSidebar';

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

export const Sidebar: React.FC<SidebarProps> = ({ 
  className = "", 
  isOpen = false,
  onClose = () => {/* No operation - optional callback */},
  mobileOnly = false,
  desktopOnly = false,
  collapsed = false,
  onToggle,
  user
}) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const isDarkMode = theme === 'dark';

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