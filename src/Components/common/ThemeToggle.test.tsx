import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

// Mock the ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without label by default', () => {
    render(<ThemeToggle />);
    
    // Should have a select element
    expect(screen.getByLabelText('Select theme')).toBeInTheDocument();
    
    // Should not show the label text
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
  });

  it('renders with label when showLabel is true', () => {
    const { useTheme } = require('../../contexts/ThemeContext');
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });

    render(<ThemeToggle showLabel={true} />);
    
    // Should show the label text
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('shows the correct icon based on theme', () => {
    // Test light theme
    const { useTheme } = require('../../contexts/ThemeContext');
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });

    const { rerender } = render(<ThemeToggle />);
    
    // Should have SunIcon for light theme
    expect(screen.getByLabelText('Select theme').nextSibling).toBeInTheDocument();
    
    // Test dark theme
    useTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
    });
    
    rerender(<ThemeToggle />);
    
    // Should have MoonIcon for dark theme
    expect(screen.getByLabelText('Select theme').nextSibling).toBeInTheDocument();
    
    // Test system theme
    useTheme.mockReturnValue({
      theme: 'system',
      setTheme: jest.fn(),
    });
    
    rerender(<ThemeToggle />);
    
    // Should have ComputerDesktopIcon for system theme
    expect(screen.getByLabelText('Select theme').nextSibling).toBeInTheDocument();
  });

  it('calls setTheme when theme is changed', () => {
    const mockSetTheme = jest.fn();
    const { useTheme } = require('../../contexts/ThemeContext');
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);
    
    // Change the theme to dark
    fireEvent.change(screen.getByLabelText('Select theme'), { target: { value: 'dark' } });
    
    // Check if setTheme was called with the correct value
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('applies custom className when provided', () => {
    render(<ThemeToggle className="custom-class" />);
    
    // The outer div should have the custom class
    const container = screen.getByLabelText('Select theme').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
}); 