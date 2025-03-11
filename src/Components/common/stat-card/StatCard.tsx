import React from 'react';

export interface StatCardProps {
  title: string;
  value: number | string;
  formatter?: (value: number | string) => string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  iconBackground?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  formatter = (val) => String(val),
  trend,
  trendLabel,
  icon,
  iconBackground = 'primary',
  className = ''
}) => {
  const formattedValue = formatter(value);
  
  const bgColors = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-purple-100 text-purple-600'
  };
  
  const iconBg = bgColors[iconBackground] || bgColors.primary;
  
  const trendColor = trend && trend > 0 ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{formattedValue}</h3>
          
          {trend !== undefined && (
            <p className={`flex items-center mt-2 text-sm ${trendColor}`}>
              <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              {trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`rounded-full p-3 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
