import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimeFrameSelector } from './TimeFrameSelector';

// Mock the TimeFrameContext
jest.mock('../../contexts/TimeFrameContext', () => ({
  useTimeFrame: () => ({
    timeFrame: '1m',
    setTimeFrame: jest.fn(),
  }),
}));

describe('TimeFrameSelector', () => {
  test('renders all time frame options', () => {
    render(<TimeFrameSelector />);
    
    // Check that all time frame options are rendered
    expect(screen.getByText('All Time')).toBeInTheDocument();
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('1W')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('6M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('5Y')).toBeInTheDocument();
  });

  test('highlights the currently selected time frame', () => {
    render(<TimeFrameSelector />);
    
    // The '1M' button should have the active class (bg-blue-600)
    const activeButton = screen.getByText('1M');
    expect(activeButton).toHaveClass('bg-blue-600');
    
    // Other buttons should not have the active class
    const inactiveButton = screen.getByText('1Y');
    expect(inactiveButton).not.toHaveClass('bg-blue-600');
  });

  test('calls setTimeFrame when a time frame option is clicked', () => {
    const mockSetTimeFrame = jest.fn();
    
    // Override the mock to provide our test-specific mock function
    jest.spyOn(require('../../contexts/TimeFrameContext'), 'useTimeFrame').mockReturnValue({
      timeFrame: '1m',
      setTimeFrame: mockSetTimeFrame,
    });
    
    render(<TimeFrameSelector />);
    
    // Click on a different time frame option
    fireEvent.click(screen.getByText('1Y'));
    
    // Check that setTimeFrame was called with the correct value
    expect(mockSetTimeFrame).toHaveBeenCalledWith('1y');
  });
}); 