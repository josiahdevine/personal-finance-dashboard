import React from 'react';
import { TimeFrame } from '../../types/common';
import { useTimeFrame } from '../../contexts/TimeFrameContext';

interface TimeFrameOption {
  label: string;
  value: TimeFrame;
}

const timeFrameOptions: TimeFrameOption[] = [
  { label: 'All Time', value: 'all' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' }
];

export const TimeFrameSelector: React.FC = () => {
  const { timeFrame, setTimeFrame } = useTimeFrame();

  return (
    <div className="flex items-center space-x-2">
      {timeFrameOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTimeFrame(option.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${timeFrame === option.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}; 