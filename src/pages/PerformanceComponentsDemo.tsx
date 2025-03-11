import React, { useState, useEffect } from 'react';
import { FinancialMetric } from '../components/common/financial-metric';
import { TransactionSummary } from '../components/features/transactions';
import { OptimizedTransactionList } from '../components/features/transactions';
import { OptimizedDataGrid, Column } from '../components/common/data-grid';
import '../styles/PerformanceComponentsDemo.css';

// Mock transaction data
interface MockTransaction {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  date: string;
  description: string;
  merchant_name: string;
  category_id: string;
  pending: boolean;
  transaction_type: 'debit' | 'credit';
  payment_channel: 'online' | 'in store' | 'other';
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  created_at: string;
  updated_at: string;
}

// Generate mock transactions
const generateMockTransactions = (count: number): MockTransaction[] => {
  const categories = ['Food', 'Shopping', 'Transportation', 'Entertainment', 'Utilities', 'Salary', 'Transfer', 'Uncategorized'];
  const merchants = ['Amazon', 'Walmart', 'Target', 'Uber', 'Netflix', 'Spotify', 'Electric Company', 'Gas Company', 'Employer Inc.'];
  
  return Array.from({ length: count }, (_, i) => {
    const isIncome = Math.random() > 0.7;
    const amount = isIncome 
      ? Math.round(Math.random() * 2000 * 100) / 100
      : -Math.round(Math.random() * 200 * 100) / 100;
      
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `tx-${i}`,
      account_id: `account-${Math.floor(Math.random() * 3) + 1}`,
      user_id: 'user-1',
      amount,
      date: date.toISOString(),
      description: `Transaction ${i + 1}`,
      merchant_name: merchants[Math.floor(Math.random() * merchants.length)],
      category_id: categories[Math.floor(Math.random() * categories.length)],
      pending: Math.random() > 0.9,
      transaction_type: amount > 0 ? 'credit' : 'debit',
      payment_channel: ['online', 'in store', 'other'][Math.floor(Math.random() * 3)] as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
};

// Create mock data for the data grid
interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: string;
  balance: number;
}

const generateMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
    balance: Math.round(Math.random() * 10000 * 100) / 100
  }));
};

const PerformanceComponentsDemo: React.FC = () => {
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setTransactions(generateMockTransactions(500));
      setUsers(generateMockUsers(1000));
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const userColumns: Column<User>[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Name', width: 20 },
    { key: 'email', header: 'Email', width: 25 },
    { 
      key: 'joinDate', 
      header: 'Join Date', 
      width: 15,
      render: (user) => new Date(user.joinDate).toLocaleDateString()
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: 10,
      render: (user) => (
        <span className={`status-badge status-${user.status}`}>
          {user.status}
        </span>
      ),
      className: 'column-status'
    },
    { 
      key: 'balance', 
      header: 'Balance', 
      width: 20,
      render: (user) => `$${user.balance.toFixed(2)}`,
      className: 'column-currency'
    }
  ];
  
  if (isLoading) {
    return <div className="loading">Loading demo data...</div>;
  }
  
  return (
    <div className="performance-demo-container">
      <h1>Performance-Optimized Components Demo</h1>
      
      <section>
        <h2>FinancialMetric Component</h2>
        <p>Memoized component for displaying financial metrics with change indicators.</p>
        
        <div className="metrics-grid">
          <FinancialMetric 
            label="Total Balance" 
            value={12345.67} 
            previousValue={10456.78} 
            formatType="currency" 
          />
          
          <FinancialMetric 
            label="Monthly Income" 
            value={4567.89} 
            previousValue={4123.45} 
            formatType="currency" 
          />
          
          <FinancialMetric 
            label="Monthly Expenses" 
            value={2345.67} 
            previousValue={2567.89} 
            formatType="currency" 
          />
          
          <FinancialMetric 
            label="Investment Growth" 
            value={7.5} 
            previousValue={5.2} 
            formatType="percentage" 
          />
        </div>
      </section>
      
      <section>
        <h2>TransactionSummary Component</h2>
        <p>Uses useMemo for efficient calculations of transaction summaries.</p>
        
        <TransactionSummary transactions={transactions as any} />
      </section>
      
      <section>
        <h2>OptimizedTransactionList Component</h2>
        <p>Virtualized list for efficiently rendering large sets of transactions.</p>
        
        <OptimizedTransactionList 
          transactions={transactions as any} 
          onSelectTransaction={(tx) => console.log('Selected transaction:', tx)} 
        />
      </section>
      
      <section>
        <h2>Optimized Data Grid</h2>
        <OptimizedDataGrid 
          data={users} 
          columns={userColumns as Column<object>[]} 
          _keyExtractor={(user: User) => user.id} 
          height={400}
          onRowClick={(user) => console.log('Selected user:', user)}
        />
      </section>
    </div>
  );
};

export default PerformanceComponentsDemo; 