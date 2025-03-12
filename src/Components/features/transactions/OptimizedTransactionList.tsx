import React, { useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Transaction } from '../../../types/Transaction';
import { formatCurrency, formatShortDate } from '../../../utils/formatters';
import './OptimizedTransactionList.css';

export interface OptimizedTransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
  className?: string;
}

const OptimizedTransactionList: React.FC<OptimizedTransactionListProps> = ({
  transactions,
  onSelectTransaction,
  className = '',
}) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Memoize sorted transactions to avoid unnecessary re-sorting
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      // Sort by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions]);

  // Fixed row height for better performance
  const ITEM_SIZE = 72;

  // Memoized row renderer function
  const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const transaction = sortedTransactions[index];
    const isSelected = transaction.id === selectedTransactionId;
    const isPositive = transaction.amount > 0;

    return (
      <div 
        style={style}
        className={`transaction-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          setSelectedTransactionId(transaction.id);
          if (onSelectTransaction) {
            onSelectTransaction(transaction);
          }
        }}
      >
        <div className="transaction-date">
          {formatShortDate(transaction.date)}
        </div>
        
        <div className="transaction-details">
          <div className="transaction-merchant">{transaction.merchant_name || transaction.description}</div>
          <div className="transaction-description">{transaction.description}</div>
        </div>
        
        <div className={`transaction-amount ${isPositive ? 'positive' : 'negative'}`}>
          {formatCurrency(transaction.amount)}
        </div>
      </div>
    );
  }, [sortedTransactions, selectedTransactionId, onSelectTransaction]);

  // Dynamic list height based on available transactions (max 5 items visible at once)
  const listHeight = useMemo(() => {
    const maxVisibleItems = 5;
    return Math.min(sortedTransactions.length * ITEM_SIZE, maxVisibleItems * ITEM_SIZE);
  }, [sortedTransactions.length, ITEM_SIZE]);

  return (
    <div className={`optimized-transaction-list ${className}`}>
      <div className="transaction-list-header">
        <h2 className="transaction-list-title">Transactions</h2>
        <div className="transaction-list-count">
          {sortedTransactions.length} {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
        </div>
      </div>

      {sortedTransactions.length > 0 ? (
        <List
          className="transaction-list-window"
          height={listHeight}
          width="100%"
          itemCount={sortedTransactions.length}
          itemSize={ITEM_SIZE}
        >
          {rowRenderer}
        </List>
      ) : (
        <div className="transaction-list-empty">
          No transactions available.
        </div>
      )}
    </div>
  );
};

export default React.memo(OptimizedTransactionList); 