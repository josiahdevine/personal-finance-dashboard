import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

// A simple component to test
const SimpleButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...props}>
    {children}
  </button>
);

describe('Test Setup', () => {
  it('should render a component', () => {
    render(<SimpleButton>Click me</SimpleButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <SimpleButton aria-label="Test button">
        Click me
      </SimpleButton>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 