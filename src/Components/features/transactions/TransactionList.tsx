import React, { useState, useEffect } from 'react';
import { createTable } from '../../common/Table/tableFactory';
import { usePlaid } from '../../../contexts/PlaidContext';
import { Transaction } from '../../../types/models';
import { Card } from '../../common/Card';
import { useDebounce } from '../../../hooks/useDebounce';

const TransactionsTable = createTable<Transaction>(
  [
    {
      key: 'date',
      header: 'Date',
      render: (transaction) => new Date(transaction.date).toLocaleDateString(),
      sortable: true
    },
    {
      key: 'name',
      header: 'Description',
      render: (transaction) => transaction.merchant_name || transaction.name,
      sortable: true
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (transaction) => `$${Math.abs(transaction.amount).toFixed(2)}`,
      sortable: true
    },
    {
      key: 'category',
      header: 'Category',
      render: (transaction) => transaction.category?.[0] || 'Uncategorized',
      sortable: true
    }
  ],
  {
    rowKey: (transaction) => transaction.id,
    defaultSort: { key: 'date', direction: 'desc' }
  }
);

export const TransactionList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { getTransactions } = usePlaid();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await getTransactions(
          thirtyDaysAgo.toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
        setTransactions(result);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [getTransactions]);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.merchant_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    transaction.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <input
            type="text"
            placeholder="Search transactions..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <TransactionsTable data={filteredTransactions} loading={loading} />
      </Card.Body>
    </Card>
  );
}; 