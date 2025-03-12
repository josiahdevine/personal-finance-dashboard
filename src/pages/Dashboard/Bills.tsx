import React from 'react';
import Bills from '../../components/features/bills';

/**
 * Bills Page Component
 * 
 * This is a page wrapper that uses the feature-based Bills component.
 * All the core functionality is implemented in the feature component.
 */
export const BillsPage: React.FC = () => {
  return <Bills />;
};

// For backward compatibility, also export as Bills
export { BillsPage as Bills }; 