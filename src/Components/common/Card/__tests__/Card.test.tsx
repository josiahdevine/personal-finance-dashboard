import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../../../../components/common/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div data-testid="test-content">Test Content</div>
      </Card>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(
      <Card className="custom-class" data-testid="card">
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('applies padding by default', () => {
    render(
      <Card data-testid="card">
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('p-6');
  });

  it('removes padding when noPadding is true', () => {
    render(
      <Card noPadding data-testid="card">
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByTestId('card')).not.toHaveClass('p-6');
  });

  it('renders header correctly', () => {
    render(
      <Card>
        <Card.Header data-testid="header">Header Content</Card.Header>
      </Card>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders body correctly', () => {
    render(
      <Card>
        <Card.Body data-testid="body">Body Content</Card.Body>
      </Card>
    );
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  it('renders footer correctly', () => {
    render(
      <Card>
        <Card.Footer data-testid="footer">Footer Content</Card.Footer>
      </Card>
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders all sections with correct styling', () => {
    render(
      <Card>
        <Card.Header data-testid="header">Header</Card.Header>
        <Card.Body data-testid="body">Body</Card.Body>
        <Card.Footer data-testid="footer">Footer</Card.Footer>
      </Card>
    );
    
    expect(screen.getByTestId('header')).toHaveClass('border-b');
    expect(screen.getByTestId('body')).toHaveClass('p-6');
    expect(screen.getByTestId('footer')).toHaveClass('border-t');
  });
}); 