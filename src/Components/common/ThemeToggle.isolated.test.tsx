import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from './ThemeToggle';

// Mock the useTheme hook
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle Component (Isolated)', () => {
  // Get the mocked function to control it in tests
  const mockUseTheme = require('../../contexts/ThemeContext').useTheme;
  const mockSetTheme = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  test('renders in light mode correctly', () => {
    // Set up the mock return value for light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle data-testid="theme-toggle" />);
    
    // Check that the select has the correct value
    const select = screen.getByLabelText('Select theme');
    expect(select).toHaveValue('light');
  });
  
  test('renders in dark mode correctly', () => {
    // Set up the mock return value for dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle data-testid="theme-toggle" />);
    
    // Check that the select has the correct value
    const select = screen.getByLabelText('Select theme');
    expect(select).toHaveValue('dark');
  });
  
  test('renders in system mode correctly', () => {
    // Set up the mock return value for system theme
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle data-testid="theme-toggle" />);
    
    // Check that the select has the correct value
    const select = screen.getByLabelText('Select theme');
    expect(select).toHaveValue('system');
  });
  
  test('shows label when showLabel is true', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle showLabel={true} />);
    
    // Should display the theme label text - use getAllByText instead of getByText
    const labels = screen.getAllByText('Light');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBeInTheDocument();
  });
  
  test('applies custom className when provided', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle className="custom-class" />);
    
    // The outer container should have the custom class
    const container = screen.getByLabelText('Select theme').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
  
  test('calls setTheme when changing theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    // Change theme to dark
    const select = screen.getByLabelText('Select theme');
    fireEvent.change(select, { target: { value: 'dark' } });
    
    // Check that setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
}); 