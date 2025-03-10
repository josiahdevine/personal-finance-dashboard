import React from 'react';
import { Button } from '../../../components/common/Button';

export type TimePeriod = '1m' | '3m' | '6m' | '1y' | 'all';

export interface PeriodSelectorProps {
  activePeriod: TimePeriod;
  periods?: TimePeriod[];
  periodLabels?: Record<TimePeriod, string>;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const defaultPeriods: TimePeriod[] = ['1m', '3m', '6m', '1y', 'all'];
const defaultLabels: Record<TimePeriod, string> = {
  '1m': '1M',
  '3m': '3M',
  '6m': '6M',
  '1y': '1Y',
  'all': 'All'
};

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  activePeriod,
  periods = defaultPeriods,
  periodLabels = defaultLabels,
  onPeriodChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`} role="group" aria-label="Time period selection">
      {periods.map((period) => (
        <Button
          key={period}
          variant={activePeriod === period ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onPeriodChange(period)}
          aria-pressed={activePeriod === period}
        >
          {periodLabels[period]}
        </Button>
      ))}
    </div>
  );
}; 