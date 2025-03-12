import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedSelect } from '../enhanced-select';

// Mock types for the ShadCN UI Select components
interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

// Mock the ShadCN UI Select components
jest.mock('../select', () => ({
  Select: ({ children, onValueChange, value, disabled }: SelectProps) => (
    <div 
      data-testid="mock-select" 
      data-value={value} 
      data-disabled={disabled ? 'true' : undefined}
      onClick={() => onValueChange('option1')}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className, id }: SelectTriggerProps) => (
    <button 
      data-testid="mock-select-trigger" 
      className={className} 
      id={id} 
      role="combobox" 
      aria-haspopup="listbox"
    >
      {children}
    </button>
  ),
  SelectValue: ({ children, placeholder }: SelectValueProps) => (
    <span 
      data-testid="mock-select-value" 
      data-placeholder={placeholder}
    >
      {children || placeholder}
    </span>
  ),
  SelectContent: ({ children }: SelectContentProps) => (
    <div data-testid="mock-select-content">
      {children}
    </div>
  ),
  SelectItem: ({ children, value }: SelectItemProps) => (
    <div 
      data-testid="mock-select-item" 
      data-value={value}
    >
      {children}
    </div>
  ),
}));

describe('EnhancedSelect', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders with options', () => {
    render(
      <EnhancedSelect
        value=""
        onChange={() => { /* mock function */ }}
        options={options}
        placeholder="Select an option"
      />
    );
    
    expect(screen.getByTestId('mock-select-value')).toHaveAttribute('data-placeholder', 'Select an option');
    expect(screen.getAllByTestId('mock-select-item').length).toBe(2);
  });

  it('passes className to the SelectTrigger', () => {
    render(
      <EnhancedSelect
        value=""
        onChange={() => { /* mock function */ }}
        options={options}
        className="test-class"
      />
    );
    
    expect(screen.getByTestId('mock-select-trigger')).toHaveClass('test-class');
  });

  it('passes id to the SelectTrigger', () => {
    render(
      <EnhancedSelect
        value=""
        onChange={() => { /* mock function */ }}
        options={options}
        id="test-id"
      />
    );
    
    expect(screen.getByTestId('mock-select-trigger')).toHaveAttribute('id', 'test-id');
  });

  it('calls onChange when an option is selected', async () => {
    const onChangeMock = jest.fn();
    render(
      <EnhancedSelect
        value=""
        onChange={onChangeMock}
        options={options}
      />
    );
    
    // Click the select to trigger the change
    await userEvent.click(screen.getByTestId('mock-select'));
    
    // Verify that onChange was called with the expected synthetic event
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'option1' }
      })
    );
  });

  it('passes disabled prop to the Select component', () => {
    render(
      <EnhancedSelect
        value=""
        onChange={() => { /* mock function */ }}
        options={options}
        disabled={true}
      />
    );
    
    expect(screen.getByTestId('mock-select')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders options with correct labels', () => {
    render(
      <EnhancedSelect
        value=""
        onChange={() => { /* mock function */ }}
        options={options}
      />
    );
    
    const items = screen.getAllByTestId('mock-select-item');
    expect(items[0].textContent).toBe('Option 1');
    expect(items[1].textContent).toBe('Option 2');
  });
}); 