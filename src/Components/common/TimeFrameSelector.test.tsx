import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeFrameSelector } from './TimeFrameSelector';
import { TimeFrameProvider } from '../../contexts/TimeFrameContext';

// Mock the TimeFrameContext
jest.mock('../../contexts/TimeFrameContext', () => ({
  useTimeFrame: jest.fn(() => ({
    timeFrame: '1m',
    setTimeFrame: jest.fn(),
  })),
  TimeFrameProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TimeFrameSelector Component', () => {
  it('renders all time frame options', () => {
    render(
      <TimeFrameProvider>
        <TimeFrameSelector />
      </TimeFrameProvider>
    );
    
    // Check if all time frame options are rendered
    expect(screen.getByText('All Time')).toBeInTheDocument();
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('1W')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('6M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('5Y')).toBeInTheDocument();
  });

  it('highlights the currently selected time frame', () => {
    const { useTimeFrame } = require('../../contexts/TimeFrameContext');
    useTimeFrame.mockReturnValue({
      timeFrame: '1m',
      setTimeFrame: jest.fn(),
    });

    render(
      <TimeFrameProvider>
        <TimeFrameSelector />
      </TimeFrameProvider>
    );
    
    // The '1M' button should have the active class (bg-blue-600)
    const activeButton = screen.getByText('1M');
    expect(activeButton.className).toContain('bg-blue-600');
    
    // Other buttons should not have the active class
    const inactiveButton = screen.getByText('1Y');
    expect(inactiveButton.className).not.toContain('bg-blue-600');
  });

  it('calls setTimeFrame when a time frame option is clicked', () => {
    const mockSetTimeFrame = jest.fn();
    const { useTimeFrame } = require('../../contexts/TimeFrameContext');
    useTimeFrame.mockReturnValue({
      timeFrame: '1m',
      setTimeFrame: mockSetTimeFrame,
    });

    render(
      <TimeFrameProvider>
        <TimeFrameSelector />
      </TimeFrameProvider>
    );
    
    // Click on a different time frame option
    fireEvent.click(screen.getByText('1Y'));
    
    // Check if setTimeFrame was called with the correct value
    expect(mockSetTimeFrame).toHaveBeenCalledWith('1y');
  });
}); 