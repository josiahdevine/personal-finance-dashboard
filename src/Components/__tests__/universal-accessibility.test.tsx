import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// This test suite is designed to work universally across all environments
// It tests basic accessibility patterns without requiring complex mocks

// Basic Button Component
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  'aria-label'?: string;
  'data-testid'?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  'aria-label': ariaLabel,
  'data-testid': testId = 'button',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-300 hover:bg-gray-400 text-black';
      case 'danger':
        return 'bg-red-500 hover:bg-red-700 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-700 text-white';
    }
  };

  return (
    <button
      className={`py-2 px-4 rounded ${getVariantClasses()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      data-testid={testId}
    >
      {label}
    </button>
  );
};

// Form Input Component
interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  'data-testid'?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  'data-testid': testId = 'input',
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-gray-700 text-sm font-bold mb-2"
        data-testid={`${testId}-label`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`shadow appearance-none border ${
          error ? 'border-red-500' : ''
        } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        data-testid={testId}
      />
      {error && (
        <p 
          id={`${id}-error`} 
          className="text-red-500 text-xs italic mt-1"
          data-testid={`${testId}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Testing the components
describe('Universal Accessibility Tests', () => {
  describe('Button Component', () => {
    it('renders with proper accessibility attributes', () => {
      const handleClick = jest.fn();
      render(
        <Button 
          label="Submit" 
          onClick={handleClick}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('aria-label', 'Submit');
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent('Submit');
    });

    it('disables the button correctly', () => {
      const handleClick = jest.fn();
      render(
        <Button 
          label="Submit" 
          onClick={handleClick}
          disabled={true}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toBeDisabled();
    });

    it('supports custom aria-label', () => {
      const handleClick = jest.fn();
      render(
        <Button 
          label="×" 
          aria-label="Close dialog"
          onClick={handleClick}
          data-testid="close-button"
        />
      );
      
      const button = screen.getByTestId('close-button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });
  });

  describe('Input Component', () => {
    it('renders with proper label and input association', () => {
      const handleChange = jest.fn();
      render(
        <Input
          id="email"
          label="Email Address"
          value=""
          onChange={handleChange}
          data-testid="email-input"
        />
      );
      
      const input = screen.getByTestId('email-input');
      const label = screen.getByTestId('email-input-label');
      
      expect(input).toHaveAttribute('id', 'email');
      expect(label).toHaveAttribute('for', 'email');
      expect(label).toHaveTextContent('Email Address');
    });

    it('indicates required fields properly', () => {
      const handleChange = jest.fn();
      render(
        <Input
          id="email"
          label="Email Address"
          value=""
          onChange={handleChange}
          required={true}
          data-testid="email-input"
        />
      );
      
      const input = screen.getByTestId('email-input');
      const label = screen.getByTestId('email-input-label');
      
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(label).toHaveTextContent('*');
    });

    it('shows error messages with proper ARIA attributes', () => {
      const handleChange = jest.fn();
      render(
        <Input
          id="email"
          label="Email Address"
          value="invalid"
          onChange={handleChange}
          error="Please enter a valid email address"
          data-testid="email-input"
        />
      );
      
      const input = screen.getByTestId('email-input');
      const errorMessage = screen.getByTestId('email-input-error');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(errorMessage).toHaveAttribute('id', 'email-error');
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    });
  });

  // Test suite for form groups and layout accessibility
  describe('Form & Layout Accessibility', () => {
    const SimpleForm = () => {
      const [values, setValues] = React.useState({
        name: '',
        email: '',
      });
      
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues({
          ...values,
          [e.target.id]: e.target.value,
        });
      };
      
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form submission logic would go here
      };
      
      return (
        <form onSubmit={handleSubmit} aria-labelledby="form-title" data-testid="test-form">
          <h2 id="form-title">Contact Information</h2>
          <Input
            id="name"
            label="Full Name"
            value={values.name}
            onChange={handleChange}
            required={true}
            data-testid="name-input"
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={values.email}
            onChange={handleChange}
            required={true}
            data-testid="email-input"
          />
          <Button
            label="Submit"
            onClick={() => {}}
            data-testid="submit-button"
          />
        </form>
      );
    };
    
    it('renders form with proper ARIA association to heading', () => {
      render(<SimpleForm />);
      
      const form = screen.getByTestId('test-form');
      expect(form).toHaveAttribute('aria-labelledby', 'form-title');
      
      const heading = screen.getByText('Contact Information');
      expect(heading).toHaveAttribute('id', 'form-title');
    });
    
    it('has all form controls properly labeled', () => {
      render(<SimpleForm />);
      
      // Check that all form controls have associated labels
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      
      expect(nameInput).toHaveAccessibleName();
      expect(emailInput).toHaveAccessibleName();
      
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAccessibleName();
    });
  });
});
