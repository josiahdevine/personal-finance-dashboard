import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

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

/**
 * EnhancedSelect is a compatibility layer for migrating from the custom Select component.
 * It wraps the ShadCN UI Select component but maintains the same API as the custom Select.
 */
export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder,
  id,
  name,
  disabled = false,
  required = false,
}) => {
  const handleValueChange = (newValue: string) => {
    // Create a synthetic event object to match the original onChange API
    onChange({
      target: {
        value: newValue
      }
    });
  };

  return (
    <Select 
      value={value} 
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EnhancedSelect;
