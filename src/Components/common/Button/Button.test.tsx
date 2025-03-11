import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  test('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('applies the correct default classes', () => {
    const { container } = render(<Button>Default Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn');
    expect(buttonElement).toHaveClass('btn-primary');
    expect(buttonElement).toHaveClass('btn-md');
  });

  test('applies the variant class correctly', () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn-secondary');
  });

  test('applies the size class correctly', () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn-lg');
  });

  test('applies full width class when isFullWidth is true', () => {
    const { container } = render(<Button isFullWidth>Full Width Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn-full-width');
  });

  test('applies disabled state when isDisabled is true', () => {
    const { container } = render(<Button isDisabled>Disabled Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn-disabled');
    expect(buttonElement).toBeDisabled();
  });

  test('applies loading state when isLoading is true', () => {
    const { container } = render(<Button isLoading>Loading Button</Button>);
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn-loading');
    expect(buttonElement).toBeDisabled();
  });

  test('calls onClick when button is clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Clickable Button</Button>);
    
    const buttonElement = screen.getByText('Clickable Button');
    fireEvent.click(buttonElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled and clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick} isDisabled>Disabled Button</Button>);
    
    const buttonElement = screen.getByText('Disabled Button');
    fireEvent.click(buttonElement);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('renders with left icon when provided', () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>With Left Icon</Button>);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  test('renders with right icon when provided', () => {
    render(<Button rightIcon={<span data-testid="right-icon" />}>With Right Icon</Button>);
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  test('combines all class variations correctly', () => {
    const { container } = render(
      <Button 
        variant="success" 
        size="sm" 
        isFullWidth 
        className="test-button"
      >
        Combined Button
      </Button>
    );
    
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('btn');
    expect(buttonElement).toHaveClass('btn-success');
    expect(buttonElement).toHaveClass('btn-sm');
    expect(buttonElement).toHaveClass('btn-full-width');
    expect(buttonElement).toHaveClass('test-button');
  });
}); 