import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { DataTable, Column } from '../../common/data-table';
import Badge from "../../common/badge/Badge";
import { formatCurrency, dateFormatter } from '../../../utils/formatters';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Define a generic transaction type for the component
interface GenericTransaction {
  id: string;
  date: string;
  name: string;
  merchant_name?: string;
  amount: number;
  category?: string[];
  pending?: boolean;
  recurring?: boolean;
  [key: string]: any;
}

// Define transaction category colors based on our design system
const categoryColors: Record<string, string> = {
  'Income': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Salary': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Food & Dining': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Groceries': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Bills & Utilities': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Electricity': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Shopping': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Transportation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Travel': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'Entertainment': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Health & Fitness': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'Education': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};

// Mock data for transactions
const mockTransactions: GenericTransaction[] = [
  {
    id: '1',
    date: '2023-03-01',
    name: 'Grocery Store',
    merchant_name: 'Whole Foods',
    amount: -120.50,
    category: ['Food & Dining', 'Groceries'],
    pending: false,
    recurring: true
  },
  {
    id: '2',
    date: '2023-03-02',
    name: 'Salary Deposit',
    merchant_name: 'Employer Inc',
    amount: 3500.00,
    category: ['Income', 'Salary'],
    pending: false,
    recurring: true
  },
  {
    id: '3',
    date: '2023-03-03',
    name: 'Electric Bill',
    merchant_name: 'Power Company',
    amount: -85.75,
    category: ['Bills & Utilities', 'Electricity'],
    pending: true,
    recurring: true
  },
  {
    id: '4',
    date: '2023-03-05',
    name: 'Online Shopping',
    merchant_name: 'Amazon',
    amount: -67.99,
    category: ['Shopping'],
    pending: false,
    recurring: false
  },
  {
    id: '5',
    date: '2023-03-08',
    name: 'Ride Share',
    merchant_name: 'Uber',
    amount: -22.50,
    category: ['Transportation'],
    pending: false,
    recurring: false
  }
];

interface TransactionListProps {
  title?: string;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onTransactionClick?: (transaction: GenericTransaction) => void;
  className?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title = 'Recent Transactions',
  limit = 5,
  showViewAll = true,
  onViewAll,
  onTransactionClick,
  className = ''
}) => {
  const [transactions, setTransactions] = useState<GenericTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([{ id: 'date', desc: true }]);
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = limit;
  const pageCount = Math.ceil(mockTransactions.length / pageSize);

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
          // Sort the data based on current sorting state
          const sortedData = [...mockTransactions].sort((a, b) => {
            const sortField = sorting[0]?.id || 'date';
            const sortDirection = sorting[0]?.desc ? -1 : 1;
            
            if (sortField === 'date') {
              return sortDirection * (new Date(a.date).getTime() - new Date(b.date).getTime());
            }
            
            if (sortField === 'amount') {
              return sortDirection * (a.amount - b.amount);
            }
            
            // Default string comparison
            const aValue = String(a[sortField] || '');
            const bValue = String(b[sortField] || '');
            return sortDirection * aValue.localeCompare(bValue);
          });
          
          setTransactions(sortedData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [sorting]);

  // Define table columns
  const columns: Column<GenericTransaction>[] = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      cell: (value) => dateFormatter(value),
      sortable: true,
      width: '15%'
    },
    {
      id: 'name',
      header: 'Description',
      accessor: (row) => row.merchant_name || row.name,
      cell: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          {row.recurring && (
            <div className="flex items-center mt-1">
              <ArrowPathIcon className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">Recurring</span>
            </div>
          )}
        </div>
      ),
      sortable: true,
      width: '30%'
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (row) => row.category?.[0] || 'Uncategorized',
      cell: renderCategoryBadge,
      sortable: true,
      width: '20%'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.pending ? 'Pending' : 'Completed',
      cell: (value) => (
        <div className="flex items-center">
          {value === 'Pending' ? (
            <>
              <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-yellow-500 text-sm">Pending</span>
            </>
          ) : (
            <span className="text-green-500 text-sm">Completed</span>
          )}
        </div>
      ),
      width: '15%'
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      cell: (value) => {
        const isNegative = value < 0;
        return (
          <div className={`flex items-center justify-end font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            {isNegative ? (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            )}
            {formatCurrency(Math.abs(value))}
          </div>
        );
      },
      sortable: true,
      align: 'right',
      width: '20%'
    }
  ];

  // Get paginated data
  const paginatedData = transactions.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  return (
    <Card className={className}>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showViewAll && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onViewAll}
          >
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={paginatedData}
          columns={columns}
          isLoading={isLoading}
          onRowClick={onTransactionClick}
          sorting={{
            sortBy: sorting,
            onSortChange: setSorting
          }}
          pagination={{
            pageIndex,
            pageSize,
            pageCount,
            onPageChange: setPageIndex
          }}
          zebra
          compact
          responsive
          showBorder={false}
          emptyState={
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                <svg 
                  className="h-6 w-6" 
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">No transactions found for this period.</p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

// Update the Badge usage in the component
const renderCategoryBadge = (value: string) => {
  const colorClass = categoryColors[value] || categoryColors['default'];
  return (
    <Badge
      className={`${colorClass} whitespace-nowrap`}
      variant="info"
    >
      {value}
    </Badge>
  );
}; 