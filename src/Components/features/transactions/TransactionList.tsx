import React, { useState, useEffect } from 'react';
import { createTable } from '../../common/Table/tableFactory';
// import { usePlaid } from '../../../contexts/PlaidContext';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { formatCurrency } from '../../../utils/formatters';

// Define a generic transaction type for the component
interface GenericTransaction {
  id: string;
  date: string;
  name: string;
  merchant_name?: string;
  amount: number;
  category?: string[];
  [key: string]: any;
}

// Mock data for transactions
const mockTransactions: GenericTransaction[] = [
  {
    id: '1',
    date: '2023-03-01',
    name: 'Grocery Store',
    merchant_name: 'Whole Foods',
    amount: -120.50,
    category: ['Food & Dining', 'Groceries']
  },
  {
    id: '2',
    date: '2023-03-02',
    name: 'Salary Deposit',
    merchant_name: 'Employer Inc',
    amount: 3500.00,
    category: ['Income', 'Salary']
  },
  {
    id: '3',
    date: '2023-03-03',
    name: 'Electric Bill',
    merchant_name: 'Power Company',
    amount: -85.75,
    category: ['Bills & Utilities', 'Electricity']
  }
];

const TransactionsTable = createTable<GenericTransaction>();

// Define columns and options separately
const columns: any[] = [
  {
    key: 'date',
    header: 'Date',
    render: (transaction: GenericTransaction) => new Date(transaction.date).toLocaleDateString(),
    sortable: true
  },
  {
    key: 'name',
    header: 'Description',
    render: (transaction: GenericTransaction) => transaction.merchant_name || transaction.name,
    sortable: true
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (transaction: GenericTransaction) => formatCurrency(transaction.amount),
    sortable: true
  },
  {
    key: 'category',
    header: 'Category',
    render: (transaction: GenericTransaction) => transaction.category?.[0] || 'Uncategorized',
    sortable: true
  }
];

export const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<GenericTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/transactions');
        // const data = await response.json();
        // setTransactions(data);
        
        // Using mock data for now
        setTimeout(() => {
          setTransactions(mockTransactions);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <Button variant="primary">View All</Button>
      </Card.Header>
      <Card.Body>
        <TransactionsTable
          data={transactions}
          columns={columns}
        />
      </Card.Body>
    </Card>
  );
}; 