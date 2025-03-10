import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { currentUser } = useAuth();
  
  // Determine the initials to display
  const getInitials = () => {
    if (currentUser?.name) {
      return currentUser.name[0].toUpperCase();
    } else if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };
  
  // Determine size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-r from-indigo-500 to-purple-600 
        flex items-center justify-center 
        shadow-md
        ${className}
      `}
    >
      <span className="text-white font-medium">
        {getInitials()}
      </span>
    </div>
  );
};
