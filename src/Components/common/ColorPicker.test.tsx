import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker Component', () => {
  const mockOnChange = jest.fn();
  const initialColor = '#ff0000';

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  test('renders with correct initial color', () => {
    render(<ColorPicker color={initialColor} onChange={mockOnChange} />);
    
    // Check color input
    const colorInput = screen.getByTestId('color-picker-input');
    expect(colorInput).toHaveValue(initialColor);
    expect(colorInput).toHaveAttribute('type', 'color');
    
    // Check text input
    const textInput = screen.getByTestId('color-text-input');
    expect(textInput).toHaveValue(initialColor);
    expect(textInput).toHaveAttribute('type', 'text');
  });

  test('calls onChange when color input is changed', () => {
    render(<ColorPicker color={initialColor} onChange={mockOnChange} />);
    
    const newColor = '#00ff00';
    const colorInput = screen.getByTestId('color-picker-input');
    
    // Change the color
    fireEvent.change(colorInput, { target: { value: newColor } });
    
    // Callback should be called with the new color
    expect(mockOnChange).toHaveBeenCalledWith(newColor);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('calls onChange when text input is changed', () => {
    render(<ColorPicker color={initialColor} onChange={mockOnChange} />);
    
    const newColor = '#0000ff';
    const textInput = screen.getByTestId('color-text-input');
    
    // Change the color via text input
    fireEvent.change(textInput, { target: { value: newColor } });
    
    // Callback should be called with the new color
    expect(mockOnChange).toHaveBeenCalledWith(newColor);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
}); 