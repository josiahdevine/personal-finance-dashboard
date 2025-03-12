/**
 * This file re-exports the EnhancedSelect component to assist in migrating from
 * the deprecated Select component.
 */

import { EnhancedSelect } from '../../../components/ui/enhanced-select';

// Re-export EnhancedSelect as Select for backward compatibility
export { EnhancedSelect as Select };

// Re-export the types
export type { SelectOption } from '../Select';

// Export the default
export default EnhancedSelect; 