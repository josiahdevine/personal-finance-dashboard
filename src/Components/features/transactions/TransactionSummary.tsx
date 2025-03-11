import React, { useMemo } from 'react';
import { Transaction } from '../../../types/Transaction';
import { formatCurrency } from '../../../utils/formatters';
import './TransactionSummary.css';

export interface TransactionSummaryProps {
  transactions: Transaction[];
  className?: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ 
  transactions,
  className = '' 
}) => {
  // Use memoization for expensive calculations
  const summary = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        categorySummary: {},
      };
    }
    
    const income = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const expenses = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    // Calculate category breakdown
    const categorySummary = transactions.reduce((acc, tx) => {
      const category = tx.category_id || 'Uncategorized';
      
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      
      acc[category].total += tx.amount;
      acc[category].count += 1;
      acc[category].transactions.push(tx);
      
      return acc;
    }, {} as Record<string, { total: number; count: number; transactions: Transaction[] }>);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income - expenses,
      categorySummary,
    };
  }, [transactions]);
  
  // Determine if we have enough data to display
  const hasData = transactions.length > 0;
  
  return (
    <div className={`transaction-summary ${className}`}>
      <div className="transaction-summary-header">
        <h2 className="transaction-summary-title">Transaction Summary</h2>
      </div>
      
      {hasData ? (
        <div className="transaction-summary-content">
          <div className="transaction-summary-metrics">
            <div className="transaction-summary-metric">
              <div className="transaction-summary-metric-label">Income</div>
              <div className="transaction-summary-metric-value positive">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>
            
            <div className="transaction-summary-metric">
              <div className="transaction-summary-metric-label">Expenses</div>
              <div className="transaction-summary-metric-value negative">
                {formatCurrency(summary.totalExpenses)}
              </div>
            </div>
            
            <div className="transaction-summary-metric">
              <div className="transaction-summary-metric-label">Net</div>
              <div className={`transaction-summary-metric-value ${summary.netAmount >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.netAmount)}
              </div>
            </div>
          </div>
          
          <div className="transaction-summary-categories">
            <h3 className="transaction-summary-subtitle">Category Breakdown</h3>
            
            <div className="transaction-summary-category-list">
              {Object.entries(summary.categorySummary)
                .sort(([, a], [, b]) => Math.abs(b.total) - Math.abs(a.total))
                .map(([category, data]) => (
                  <div key={category} className="transaction-summary-category-item">
                    <div className="transaction-summary-category-name">
                      {category}
                    </div>
                    <div className={`transaction-summary-category-value ${data.total >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(data.total)}
                    </div>
                    <div className="transaction-summary-category-count">
                      {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="transaction-summary-empty">
          No transaction data available for summary.
        </div>
      )}
    </div>
  );
};

export default TransactionSummary; 