import React, { useEffect } from 'react';
import BillsAnalysis from '../Components/BillsAnalysis';
import { useAuth } from '../contexts/AuthContext';
import { useFinanceData } from '../contexts/FinanceDataContext';
import { log, logError } from '../utils/logger';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
function ErrorFallback({ error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong:</h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => window.location.reload()} onKeyDown={() => window.location.reload()} role="button" tabIndex={0}
      >
        Try again
      </button>
    </div>
  );
}

function BillsAnalysisPage() {
  const { currentUser } = useAuth();
  const { 
    updateMonthlyExpense, 
    deleteMonthlyExpense,
    updateFinancialSummary
  } = useFinanceData();

  useEffect(() => {
    log('BillsAnalysisPage', 'Bills Analysis Page mounted');
    
    // Update the document title
    document.title = 'Bills Analysis | Personal Finance Dashboard';
    
    return () => {
      log('BillsAnalysisPage', 'Bills Analysis Page unmounting');
    };
  }, []);

  // Custom props to pass to the BillsAnalysis component
  const billsAnalysisProps = {
    // Pass down functions from FinanceDataContext
    onExpenseAdded: (expense) => {
      log('BillsAnalysisPage', 'Expense added, updating context', expense);
      updateMonthlyExpense(expense);
      updateFinancialSummary();
    },
    onExpenseDeleted: (expenseId) => {
      log('BillsAnalysisPage', 'Expense deleted, updating context', { expenseId });
      deleteMonthlyExpense(expenseId);
      updateFinancialSummary();
    },
    onExpensesUpdated: (expenses) => {
      log('BillsAnalysisPage', 'Multiple expenses updated');
      // Update each expense in the context
      expenses.forEach(expense => updateMonthlyExpense(expense));
      updateFinancialSummary();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bills Analysis</h1>
      
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BillsAnalysis {...billsAnalysisProps} />
      </ErrorBoundary>
    </div>
  );
}

export default BillsAnalysisPage; 