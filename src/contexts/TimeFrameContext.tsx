import React, { createContext, useContext, useState } from 'react';
import { TimeFrame } from '../types/common';

interface TimeFrameContextType {
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const TimeFrameContext = createContext<TimeFrameContextType | undefined>(undefined);

export const useTimeFrame = () => {
  const context = useContext(TimeFrameContext);
  if (!context) {
    throw new Error('useTimeFrame must be used within a TimeFrameProvider');
  }
  return context;
};

interface TimeFrameProviderProps {
  children: React.ReactNode;
}

export const TimeFrameProvider: React.FC<TimeFrameProviderProps> = ({ children }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');

  return (
    <TimeFrameContext.Provider value={{ timeFrame, setTimeFrame }}>
      {children}
    </TimeFrameContext.Provider>
  );
}; 