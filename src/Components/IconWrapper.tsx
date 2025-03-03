import React from 'react';
import { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon, className }) => {
  return React.createElement(icon, { className });
};

export default IconWrapper; 