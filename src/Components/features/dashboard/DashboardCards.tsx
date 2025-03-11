import React from 'react';
import './DashboardCards.css';

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  title,
  size = 'medium',
  className = '',
}) => {
  const sizeClass = `dashboard-card-${size}`;
  
  return (
    <div className={`dashboard-card ${sizeClass} ${className}`}>
      {title && <h2 className="dashboard-card-title">{title}</h2>}
      <div className="dashboard-card-content">
        {children}
      </div>
    </div>
  );
};

interface DashboardCardsProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`dashboard-cards ${className}`}>
      {children}
    </div>
  );
};

export { DashboardCard, DashboardCards }; 