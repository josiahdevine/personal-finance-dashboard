import React from 'react';
import { Button } from '../../components/ui/button';
import { TimeFrame } from '../../types/common';
import { useTimeFrame } from '../../contexts/TimeFrameContext';
import { cn } from '../../lib/utils';

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

/**
 * TimeFrameSelector component for selecting time frames.
 * Uses ShadCN UI Button component for a consistent look and feel.
 */
export const TimeFrameSelector: React.FC = () => {
  const { timeFrame, setTimeFrame } = useTimeFrame();

  return (
    <div className="flex items-center space-x-2">
      {timeFrameOptions.map((option) => (
        <Button
          key={option.value}
          variant={timeFrame === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFrame(option.value)}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            timeFrame !== option.value && "text-gray-600 hover:text-gray-900"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}; 