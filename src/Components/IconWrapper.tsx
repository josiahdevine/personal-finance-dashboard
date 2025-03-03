import React from 'react';
import { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, className }) => {
  return <Icon className={className} />;
};

export default IconWrapper; 