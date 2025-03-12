import React, { useEffect } from 'react';
import { EnhancedSelect } from '../../components/ui/enhanced-select';

// Re-export the SelectOption interface for backward compatibility
export interface SelectOption {
  value: string;
  label: string;
}

// Keep the same props interface for backward compatibility
export interface SelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the EnhancedSelect component from src/components/ui/enhanced-select.tsx instead.
 * See docs/components/SELECT_MIGRATION_GUIDE.md for migration instructions.
 */
export const Select: React.FC<SelectProps> = (props) => {
  useEffect(() => {
    console.warn(
      'Warning: Select component is deprecated. Please use EnhancedSelect from src/components/ui/enhanced-select.tsx. ' +
      'See docs/components/SELECT_MIGRATION_GUIDE.md for migration instructions.'
    );
  }, []);

  return <EnhancedSelect {...props} />;
};

export default Select; 