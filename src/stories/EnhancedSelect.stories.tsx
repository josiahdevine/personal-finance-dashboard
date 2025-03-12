import React, { useState } from 'react';
import { EnhancedSelect } from '../components/ui/enhanced-select';

// Define the props interface to match the component
interface SelectOption {
  value: string;
  label: string;
}

interface EnhancedSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement> | any) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

// Define types for Storybook
type ComponentMeta<T> = {
  title: string;
  component: T;
  parameters?: Record<string, any>;
  argTypes?: Record<string, any>;
};

// Story type that supports args property
type StoryObj<T> = {
  (args: T): JSX.Element;
  args?: Partial<T>;
  storyName?: string;
};

export default {
  title: 'Components/EnhancedSelect',
  component: EnhancedSelect,
  parameters: {
    // Optional parameter to center the component in the Canvas
    layout: 'centered',
    // Storybook a11y addon configuration
    a11y: {
      // accessibility options
      config: {
        rules: [
          {
            // This ensures all ARIA attributes are valid
            id: 'aria-valid-attr',
            enabled: true,
          },
        ],
      },
    },
  },
  // Define control types for the component props
  argTypes: {
    value: { 
      control: 'text',
      description: 'The selected value',
    },
    onChange: { 
      action: 'changed',
      description: 'Callback when selection changes',
    },
    options: { 
      control: 'object',
      description: 'Array of options for the select',
    },
    className: { 
      control: 'text',
      description: 'Additional CSS classes',
    },
    placeholder: { 
      control: 'text',
      description: 'Placeholder text',
    },
    id: { 
      control: 'text',
      description: 'ID for the select element',
    },
    name: { 
      control: 'text',
      description: 'Name for the select element',
    },
    disabled: { 
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    required: { 
      control: 'boolean',
      description: 'Whether the select is required',
    },
  },
} as ComponentMeta<typeof EnhancedSelect>;

// Create a template for the component
const Template: StoryObj<EnhancedSelectProps> = (args: EnhancedSelectProps) => {
  const [value, setValue] = useState(args.value);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    args.onChange?.(e);
  };
  
  return (
    <div className="p-4 max-w-md">
      <EnhancedSelect {...args} value={value} onChange={handleChange} />
    </div>
  );
};

// Default variant
export const Default = Template.bind({});
Default.args = {
  value: '',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
  onChange: () => {},
};

// With a selected value
export const WithValue = Template.bind({});
WithValue.args = {
  value: 'option2',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
  onChange: () => {},
};

// Disabled state
export const Disabled = Template.bind({});
Disabled.args = {
  value: '',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
  disabled: true,
  onChange: () => {},
};

// Many options example
export const ManyOptions = Template.bind({});
ManyOptions.args = {
  value: '',
  options: Array.from({ length: 20 }, (_, i) => ({
    value: `option${i + 1}`,
    label: `Option ${i + 1}`,
  })),
  placeholder: 'Select an option',
  onChange: () => {},
};

// Long option labels
export const LongLabels = Template.bind({});
LongLabels.args = {
  value: '',
  options: [
    { value: 'option1', label: 'This is a very long option label that should wrap properly' },
    { value: 'option2', label: 'Another long option label with lots of text to display' },
    { value: 'option3', label: 'Short option' },
  ],
  placeholder: 'Select an option',
  onChange: () => {},
}; 