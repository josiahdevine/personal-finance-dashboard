import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  sorting?: {
    sortBy: SortingState[];
    onSortChange: (sortBy: SortingState[]) => void;
  };
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  zebra?: boolean;
  compact?: boolean;
  className?: string;
  showBorder?: boolean;
  fullWidth?: boolean;
  stickyHeader?: boolean;
  responsive?: boolean;
  hiddenColumns?: string[];
}

export function DataTable<T extends object>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyState,
  sorting,
  pagination,
  zebra = false,
  compact = false,
  className = '',
  showBorder = true,
  fullWidth = true,
  stickyHeader = false,
  responsive = true,
  hiddenColumns = []
}: DataTableProps<T>) {
  const { isDarkMode } = useTheme();
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  // Filter out hidden columns
  const visibleColumns = useMemo(() => {
    return columns.filter(column => !hiddenColumns.includes(column.id));
  }, [columns, hiddenColumns]);

  // Extract value from a row using accessor function or key
  const getCellValue = (row: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  };

  // Generate table classes
  const tableClasses = [
    'min-w-full',
    'divide-y',
    isDarkMode ? 'divide-gray-700' : 'divide-gray-200',
    showBorder ? (isDarkMode ? 'border border-gray-700' : 'border border-gray-200') : '',
    compact ? 'table-compact' : '',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  // Header classes
  const headerClasses = [
    'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600',
    stickyHeader ? 'sticky top-0 z-10' : ''
  ].filter(Boolean).join(' ');

  // Cell classes
  const cellBaseClasses = 'px-6 py-4';

  // Row classes
  const getRowClasses = (index: number) => {
    const isHovered = hoveredRowIndex === index;
    const isEven = index % 2 === 0;
    
    return [
      onRowClick ? 'cursor-pointer' : '',
      isHovered ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') : '',
      zebra && isEven ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-50') : '',
      zebra && !isEven ? (isDarkMode ? 'bg-gray-900' : 'bg-white') : '',
      !zebra ? (isDarkMode ? 'bg-gray-900' : 'bg-white') : '',
      compact ? 'h-10' : '',
      isDarkMode ? 'text-gray-200' : 'text-gray-700'
    ].filter(Boolean).join(' ');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className={`h-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded mb-4`} />
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded mb-2`} 
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <div 
        className={`w-full border rounded-lg p-8 flex flex-col items-center justify-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}
      >
        {emptyState || (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No data available at this time.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${showBorder ? 'rounded-lg' : ''}`}>
      <div className={responsive ? 'overflow-x-auto' : ''}>
        <table className={tableClasses}>
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              {visibleColumns.map(column => (
                <th
                  key={column.id}
                  scope="col"
                  className={`${headerClasses} ${column.className || ''} ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sorting && (
                      <button
                        className="ml-1 focus:outline-none"
                        onClick={() => {
                          const currentSort = sorting.sortBy.find(sort => sort.id === column.id);
                          const newSort: SortingState[] = currentSort
                            ? [{ id: column.id, desc: !currentSort.desc }]
                            : [{ id: column.id, desc: false }];
                          sorting.onSortChange(newSort);
                        }}
                      >
                        {sorting.sortBy.find(sort => sort.id === column.id) ? (
                          sorting.sortBy.find(sort => sort.id === column.id)?.desc ? (
                            <ChevronDownIcon className="h-4 w-4 text-blue-500" />
                          ) : (
                            <ChevronUpIcon className="h-4 w-4 text-blue-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100">
                            <ChevronUpIcon className="h-2 w-4" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {data.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  className={getRowClasses(rowIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                >
                  {visibleColumns.map(column => {
                    const value = getCellValue(row, column.accessor);
                    return (
                      <td
                        key={column.id}
                        className={`${cellBaseClasses} ${column.className || ''} ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${compact ? 'py-2' : ''}`}
                      >
                        {column.cell ? column.cell(value, row) : String(value)}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div 
          className={`${isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'} 
            px-4 py-3 flex items-center justify-between sm:px-6`}
        >
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Showing{' '}
                <span className="font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    data.length
                  )}
                </span>{' '}
                of{' '}
                <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                  disabled={pagination.pageIndex === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  } ${
                    pagination.pageIndex === 0 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[...Array(pagination.pageCount)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => pagination.onPageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      i === pagination.pageIndex
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : isDarkMode
                        ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                  disabled={pagination.pageIndex === pagination.pageCount - 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  } ${
                    pagination.pageIndex === pagination.pageCount - 1 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 