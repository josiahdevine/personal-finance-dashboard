import React, { useState, useEffect, useCallback, useRef, KeyboardEvent, useMemo } from 'react';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { CSVLink } from 'react-csv';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export interface DataGridColumn<T> {
  field: keyof T | string;
  headerName: string;
  width?: number | string;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: { row: T; value: any; index: number }) => React.ReactNode;
  valueGetter?: (params: { row: T }) => any;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  hide?: boolean;
  resizable?: boolean;
  filterOperators?: Array<'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'>;
}

export interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  dataSource: T[] | ((params: DataGridFetchParams) => Promise<DataGridResponse<T>>);
  rowKey: keyof T | ((row: T) => string);
  pagination?: boolean;
  pageSize?: number;
  serverSide?: boolean;
  rowSelection?: 'single' | 'multiple' | 'none';
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  toolbar?: React.ReactNode;
  loading?: boolean;
  className?: string;
  autoHeight?: boolean;
  getRowClassName?: (params: { row: T; index: number }) => string;
  initialSort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  rowDetailExpansion?: (row: T) => React.ReactNode;
  showExport?: boolean;
  exportFileName?: string;
}

export interface DataGridFetchParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface DataGridResponse<T> {
  data: T[];
  total: number;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey,
  pagination = true,
  pageSize = 10,
  serverSide = false,
  rowSelection = 'none',
  onRowClick,
  onSelectionChange,
  toolbar,
  loading: externalLoading,
  className = '',
  autoHeight = false,
  getRowClassName,
  initialSort,
  onSortChange,
  rowDetailExpansion,
  showExport = false,
  exportFileName = 'data-export',
}: DataGridProps<T>) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(initialSort || null);
  const [filters, setFilters] = useState<Record<string, { value: any; operator: string }>>({});
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const tableRef = useRef<HTMLTableElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  // Helper function to get row ID
  const getRowId = useCallback((item: T) => 
    typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey])
  , [rowKey]);
  
  // Fetch data from server if serverSide is true
  const { execute: fetchData, data: fetchedData, loading: fetchLoading, error } = 
    useAsyncAction<DataGridResponse<T>>(
      async (params: DataGridFetchParams) => {
        if (typeof dataSource === 'function') {
          return await dataSource(params);
        }
        return { data: [], total: 0 };
      }
    );
  
  const loading = externalLoading !== undefined ? externalLoading : fetchLoading;
  
  // Initialize data based on dataSource type
  const [localData, setLocalData] = useState<{
    data: T[];
    total: number;
  }>({
    data: [],
    total: 0,
  });
  
  // Handle data source initialization and updates
  useEffect(() => {
    if (Array.isArray(dataSource)) {
      setLocalData({
        data: dataSource,
        total: dataSource.length,
      });
    } else if (serverSide) {
      fetchData({
        page,
        pageSize,
        sortField: sortConfig?.field,
        sortDirection: sortConfig?.direction,
        filters,
      });
    }
  }, [dataSource, serverSide, page, pageSize, sortConfig, filters, fetchData]);
  
  // Update local data when fetch completes
  useEffect(() => {
    if (fetchedData) {
      setLocalData(fetchedData);
    }
  }, [fetchedData]);
  
  // Handle sorting
  const handleSort = useCallback(
    (field: string) => {
      const column = columns.find(col => col.field === field);
      if (!column?.sortable) return;
      
      const newDirection = 
        sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' as const : 'asc' as const;
      
      const newSortConfig = {
        field,
        direction: newDirection,
      };
      
      setSortConfig(newSortConfig);
      
      if (onSortChange) {
        onSortChange(field, newDirection);
      }
    },
    [columns, sortConfig, onSortChange]
  );
  
  // Handle selection
  const handleRowSelection = useCallback(
    (row: T) => {
      if (rowSelection === 'none') return;
      
      let newSelectedRows: T[];
      const rowId = getRowId(row);
      const isSelected = selectedRows.some(r => getRowId(r) === rowId);
      
      if (rowSelection === 'single') {
        newSelectedRows = isSelected ? [] : [row];
      } else {
        newSelectedRows = isSelected
          ? selectedRows.filter(r => getRowId(r) !== rowId)
          : [...selectedRows, row];
      }
      
      setSelectedRows(newSelectedRows);
      
      if (onSelectionChange) {
        onSelectionChange(newSelectedRows);
      }
    },
    [rowSelection, selectedRows, getRowId, onSelectionChange]
  );
  
  // Determine displayed data
  const displayData = serverSide
    ? localData.data
    : Array.isArray(dataSource)
    ? paginateData(filterData(sortData(dataSource)))
    : [];
  
  // Helper functions for client-side operations
  function sortData(data: T[]) {
    if (!sortConfig) return data;
    
    const { field, direction } = sortConfig;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.field === field);
      const aValue = column?.valueGetter 
        ? column.valueGetter({ row: a })
        : a[field as keyof T];
      const bValue = column?.valueGetter
        ? column.valueGetter({ row: b })
        : b[field as keyof T];
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  function filterData(data: T[]) {
    return data.filter(row => {
      return Object.entries(filters).every(([field, filter]) => {
        if (!filter.value) return true;
        
        const column = columns.find(col => col.field === field);
        const cellValue = column?.valueGetter
          ? column.valueGetter({ row })
          : row[field as keyof T];
        
        if (typeof cellValue === 'string') {
          const { operator } = filter;
          switch (operator) {
            case 'equals':
              return cellValue.toLowerCase() === filter.value.toLowerCase();
            case 'contains':
              return cellValue.toLowerCase().includes(filter.value.toLowerCase());
            case 'startsWith':
              return cellValue.toLowerCase().startsWith(filter.value.toLowerCase());
            case 'endsWith':
              return cellValue.toLowerCase().endsWith(filter.value.toLowerCase());
            default:
              return false;
          }
        }
        
        return String(cellValue) === String(filter.value);
      });
    });
  }
  
  function paginateData(data: T[]) {
    if (!pagination) return data;
    
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }
  
  // Handle pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(localData.total / pageSize);
  
  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent, field: string) => {
    e.preventDefault();
    setResizingColumn(field);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[field] || 100;
    
    const handleResizeMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const diff = e.clientX - resizeStartX.current;
        setColumnWidths(prev => ({
          ...prev,
          [field]: Math.max(50, resizeStartWidth.current + diff)
        }));
      }
    };
    
    const handleResizeEnd = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle row expansion
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    if (!focusedCell) return;
    
    const { rowIndex, colIndex } = focusedCell;
    const visibleColumns = columns.filter(col => !col.hide);
    
    switch (e.key) {
      case 'ArrowUp':
        if (rowIndex > 0) {
          setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
        }
        break;
      case 'ArrowDown':
        if (rowIndex < displayData.length - 1) {
          setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
        }
        break;
      case 'ArrowRight':
        if (colIndex < visibleColumns.length - 1) {
          setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
        }
        break;
      case 'Enter':
        if (rowDetailExpansion && typeof rowDetailExpansion === 'function') {
          const rowId = getRowId(displayData[rowIndex]);
          toggleRowExpansion(rowId);
        }
        break;
      default:
        break;
    }
  };

  // Prepare data for export
  const exportData = displayData.map(row => {
    const exportRow: Record<string, any> = {};
    columns.forEach(column => {
      if (!column.hide) {
        const value = column.valueGetter
          ? column.valueGetter({ row })
          : row[column.field as keyof T];
        exportRow[column.headerName] = value;
      }
    });
    return exportRow;
  });

  const colSpan = useMemo(() => {
    return (
      columns.filter(column => !column.hide).length +
      (rowSelection !== 'none' ? 1 : 0) +
      (rowDetailExpansion !== undefined ? 1 : 0)
    );
  }, [columns, rowSelection, rowDetailExpansion]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar with filters and export */}
      <div className="mb-4 flex justify-between items-center">
        {toolbar && <div>{toolbar}</div>}
        <div className="flex gap-4">
          {columns.some(col => col.filterable) && (
            <div className="flex gap-2">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <div key={column.field as string} className="flex items-center gap-2">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={filters[column.field as string]?.operator || 'equals'}
                      onChange={e => setFilters(prev => ({
                        ...prev,
                        [column.field as string]: {
                          ...prev[column.field as string],
                          operator: e.target.value
                        }
                      }))}
                    >
                      {(column.filterOperators || ['equals', 'contains']).map(op => (
                        <option key={op} value={op}>
                          {op.charAt(0).toUpperCase() + op.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={`Filter ${column.headerName}`}
                      className="text-sm border rounded px-2 py-1"
                      value={filters[column.field as string]?.value || ''}
                      onChange={e => setFilters(prev => ({
                        ...prev,
                        [column.field as string]: {
                          ...prev[column.field as string],
                          value: e.target.value
                        }
                      }))}
                    />
                  </div>
                ))}
            </div>
          )}
          {showExport && (
            <CSVLink
              data={exportData}
              filename={`${exportFileName}.csv`}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
            >
              Export CSV
            </CSVLink>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${autoHeight ? '' : 'flex-1'}`}>
        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded mb-4">
            Error loading data: {error.message}
          </div>
        )}
        
        <table
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Table header */}
          <thead className="bg-gray-50">
            <tr>
              {rowSelection !== 'none' && (
                <th className="w-12 px-4 py-3">
                  {rowSelection === 'multiple' && (
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length > 0 &&
                        selectedRows.length === displayData.length
                      }
                      onChange={() => {
                        const newSelectedRows =
                          selectedRows.length === displayData.length ? [] : [...displayData];
                        setSelectedRows(newSelectedRows);
                        if (onSelectionChange) {
                          onSelectionChange(newSelectedRows);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  )}
                </th>
              )}
              
              {columns
                .filter(column => !column.hide)
                .map(column => (
                  <th
                    key={column.field as string}
                    className={`px-6 py-3 text-${column.headerAlign || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer' : ''
                    }`}
                    style={{ width: column.width, flex: column.flex }}
                    onClick={() => handleSort(column.field as string)}
                  >
                    <div className="flex items-center">
                      <span>{column.headerName}</span>
                      {sortConfig?.field === column.field && (
                        <span className="ml-2">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 py-4 text-center"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 py-4 text-center"
                >
                  No data available
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => {
                const rowId = getRowId(row);
                const isExpanded = expandedRows.has(rowId);
                const isSelected = selectedRows.some(
                  selectedRow => getRowId(selectedRow) === rowId
                );
                
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={`${
                        onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                      } ${isSelected ? 'bg-blue-50' : ''} ${
                        getRowClassName ? getRowClassName({ row, index: rowIndex }) : ''
                      }`}
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row);
                        }
                      }}
                    >
                      {rowSelection !== 'none' && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation();
                              handleRowSelection(row);
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                      )}
                      
                      {columns
                        .filter(column => !column.hide)
                        .map((column, colIndex) => {
                          const field = column.field as string;
                          const value = column.valueGetter
                            ? column.valueGetter({ row })
                            : row[field as keyof T];
                          
                          return (
                            <td
                              key={field}
                              className={`px-6 py-4 text-${column.align || 'left'} ${
                                typeof value === 'string' && value.length > 100
                                  ? 'truncate'
                                  : 'whitespace-nowrap'
                              } ${
                                focusedCell?.rowIndex === rowIndex &&
                                focusedCell?.colIndex === colIndex
                                  ? 'outline outline-2 outline-blue-500'
                                  : ''
                              }`}
                              style={{
                                width: columnWidths[field] || column.width,
                                flex: column.flex
                              }}
                              onClick={() => setFocusedCell({ rowIndex, colIndex })}
                            >
                              {column.renderCell
                                ? column.renderCell({ row, value, index: rowIndex })
                                : value}
                              {column.resizable && (
                                <div
                                  className="absolute top-0 right-0 w-4 h-full cursor-col-resize hover:bg-gray-200"
                                  onMouseDown={e => handleResizeStart(e, field)}
                                />
                              )}
                            </td>
                          );
                        })}
                      
                      {rowDetailExpansion && (
                        <td className="px-4 py-4">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleRowExpansion(rowId);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </td>
                      )}
                    </tr>
                    {isExpanded && rowDetailExpansion && (
                      <tr>
                        <td
                          colSpan={colSpan}
                          className="px-6 py-4 bg-gray-50"
                        >
                          {rowDetailExpansion(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                page === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                page === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, localData.total)}</span> to{' '}
                <span className="font-medium">{Math.min(page * pageSize, localData.total)}</span> of{' '}
                <span className="font-medium">{localData.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Generate page buttons */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === pageNum
                          ? 'bg-blue-50 text-blue-600 z-10'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    page === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 