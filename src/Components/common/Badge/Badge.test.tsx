import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from './Badge';

describe('Badge Component', () => {
  test('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  test('applies the correct default classes', () => {
    const { container } = render(<Badge>Default Badge</Badge>);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('badge');
    expect(badgeElement).toHaveClass('badge-primary');
    expect(badgeElement).toHaveClass('badge-md');
  });

  test('applies the variant class correctly', () => {
    const { container } = render(<Badge variant="success">Success Badge</Badge>);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('badge-success');
  });

  test('applies the size class correctly', () => {
    const { container } = render(<Badge size="sm">Small Badge</Badge>);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('badge-sm');
  });

  test('applies additional class names when provided', () => {
    const { container } = render(<Badge className="custom-class">Custom Badge</Badge>);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('custom-class');
  });

  test('combines all class variations correctly', () => {
    const { container } = render(
      <Badge 
        variant="danger" 
        size="lg" 
        className="test-badge"
      >
        Combined Badge
      </Badge>
    );
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('badge');
    expect(badgeElement).toHaveClass('badge-danger');
    expect(badgeElement).toHaveClass('badge-lg');
    expect(badgeElement).toHaveClass('test-badge');
  });
}); 