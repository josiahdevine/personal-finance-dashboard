import React from 'react';
import SalaryJournal from '../../components/features/dashboard/SalaryJournal';

/**
 * SalaryJournal Page Component
 * 
 * This is a page wrapper that uses the feature-based SalaryJournal component.
 * All the core functionality is implemented in the feature component.
 */
export const SalaryJournalPage: React.FC = () => {
  return <SalaryJournal />;
};

// For backward compatibility, also export as SalaryJournal
export { SalaryJournalPage as SalaryJournal }; 