import React, { useState, useMemo, useEffect } from 'react';
import './Table.css';

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  show?: boolean | ((breakpoint: string) => boolean);
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  sortable?: boolean;
  initialSortBy?: { key: string; direction: 'asc' | 'desc' };
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
}

function Table<T extends object>({
  data,
  columns,
  onRowClick,
  className = '',
  striped = true,
  hoverable = true,
  sortable = true,
  initialSortBy,
  loading = false,
  loadingRows = 5,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSortBy || null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState(getBreakpoint());
  
  // Function to determine current breakpoint
  function getBreakpoint(): string {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    if (width < 480) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    return 'xl';
  }
  
  // Update breakpoint on window resize
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = getBreakpoint();
      if (breakpoint !== currentBreakpoint) {
        setCurrentBreakpoint(breakpoint);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentBreakpoint]);
  
  // Filter columns based on breakpoint
  const visibleColumns = columns.filter(column => {
    if (column.show === undefined) return true;
    if (typeof column.show === 'function') return column.show(currentBreakpoint);
    return column.show;
  });
  
  // Request sort
  const requestSort = (key: string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Sort data if sorting is configured
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column) return 0;
      
      let valueA, valueB;
      
      if (typeof column.accessor === 'function') {
        valueA = column.accessor(a);
        valueB = column.accessor(b);
      } else {
        valueA = a[column.accessor];
        valueB = b[column.accessor];
      }
      
      if (valueA === valueB) return 0;
      
      const result = valueA > valueB ? 1 : -1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig, columns]);
  
  // Generate loading skeleton rows
  const renderLoadingRows = () => {
    return Array(loadingRows).fill(0).map((_, rowIndex) => (
      <tr key={`skeleton-${rowIndex}`} className="table-loading-row">
        {visibleColumns.map((column, colIndex) => (
          <td key={`skeleton-${rowIndex}-${colIndex}`}>
            <div className="table-loading-cell" style={{ width: '100%' }}></div>
          </td>
        ))}
      </tr>
    ));
  };
  
  // Check if there's data to display
  const hasData = !loading && data.length > 0;
  
  // Generate table classes
  const tableClasses = [
    'table',
    striped ? 'table-striped' : '',
    hoverable ? 'table-hoverable' : '',
    onRowClick ? 'table-clickable' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className="table-container">
      <table className={tableClasses}>
        <thead className="table-header">
          <tr>
            {visibleColumns.map(column => (
              <th 
                key={column.id}
                className={`table-align-${column.align || 'left'} ${column.sortable !== false && sortable ? 'sortable' : ''} ${sortConfig && sortConfig.key === column.id ? 'sorted' : ''}`}
                style={{ width: column.width }}
                onClick={() => column.sortable !== false && sortable && requestSort(column.id)}
              >
                {column.header}
                {column.sortable !== false && sortable && sortConfig && sortConfig.key === column.id && (
                  <span className={`sort-icon ${sortConfig.direction}`}>
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="table-body">
          {loading ? (
            renderLoadingRows()
          ) : hasData ? (
            sortedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {visibleColumns.map(column => {
                  let cellValue;
                  
                  if (typeof column.accessor === 'function') {
                    cellValue = column.accessor(row);
                  } else {
                    cellValue = row[column.accessor];
                  }
                  
                  const cellContent = column.cell 
                    ? column.cell(cellValue, row)
                    : cellValue;
                  
                  return (
                    <td 
                      key={column.id} 
                      className={`table-align-${column.align || 'left'}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={visibleColumns.length} 
                className="table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table; 