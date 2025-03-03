import React, { useEffect } from 'react';
import SalaryJournal from '../Components/SalaryJournal';
import { useAuth } from '../contexts/AuthContext';
import { useFinanceData } from '../contexts/FinanceDataContext';
import { log, logError } from '../utils/logger';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../Components/ui';

// Error fallback component
function ErrorFallback({ error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong:</h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <Button
        variant="destructive"
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>
    </div>
  );
}

function SalaryJournalPage() {
  const { currentUser } = useAuth();
  const { 
    updateSalaryEntry,
    deleteSalaryEntry,
    updateFinancialSummary
  } = useFinanceData();

  useEffect(() => {
    log('SalaryJournalPage', 'Salary Journal Page mounted');
    
    // Update the document title
    document.title = 'Salary Journal | Personal Finance Dashboard';
    
    return () => {
      log('SalaryJournalPage', 'Salary Journal Page unmounting');
    };
  }, []);

  // Custom props to pass to the SalaryJournal component
  const salaryJournalProps = {
    // Pass down functions from FinanceDataContext
    onSalaryAdded: (salary) => {
      log('SalaryJournalPage', 'Salary entry added, updating context', salary);
      updateSalaryEntry(salary);
      updateFinancialSummary();
    },
    onSalaryDeleted: (salaryId) => {
      log('SalaryJournalPage', 'Salary entry deleted, updating context', { salaryId });
      deleteSalaryEntry(salaryId);
      updateFinancialSummary();
    },
    onSalaryUpdated: (salary) => {
      log('SalaryJournalPage', 'Salary entry updated, updating context', salary);
      updateSalaryEntry(salary);
      updateFinancialSummary();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Salary Journal</h1>
      
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SalaryJournal {...salaryJournalProps} />
      </ErrorBoundary>
    </div>
  );
}

export default SalaryJournalPage; 