import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color = 'bg-blue-500',
  height = 'h-2'
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="relative">
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} transition-all duration-300 ease-in-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 