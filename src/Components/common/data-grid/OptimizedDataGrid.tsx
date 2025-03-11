import React from 'react';
import { FixedSizeGrid } from 'react-window';
import './OptimizedDataGrid.css';

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface OptimizedDataGridProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  _keyExtractor: (item: T) => string;
  className?: string;
  rowHeight?: number;
  height?: number;
  width?: number | string;
  onRowClick?: (item: T) => void;
}

function OptimizedDataGrid<T extends object>({
  data,
  columns,
  _keyExtractor,
  className = '',
  rowHeight = 48,
  height = 400,
  width = '100%',
  onRowClick,
}: OptimizedDataGridProps<T>): JSX.Element {
  // Define refs for row and header elements
  const _gridRef = React.useRef<FixedSizeGrid>(null);

  // Calculate total width of columns
  const totalColumns = columns.length;
  
  // Calculate even column widths if none specified
  const _columnWidths = columns.map(col => col.width || 100 / totalColumns);
  
  // Ensure width is a number for the Grid component
  const gridWidth = typeof width === 'number' ? width : 800; // Default width if width is a string
  
  // Calculate the fixed column width (average) since the Grid component expects a fixed number
  const fixedColumnWidth = Math.floor(gridWidth / totalColumns);

  // Cell renderer
  const CellRenderer = React.useCallback(
    ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      // Header row
      if (rowIndex === 0) {
        return (
          <div
            style={{
              ...style,
              fontWeight: 'bold',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'var(--bg-header, #f9fafb)'
            }}
            className={`${columns[columnIndex].className || ''}`}
          >
            {columns[columnIndex].header}
          </div>
        );
      }

      // Data rows
      const item = data[rowIndex - 1];
      const column = columns[columnIndex];
      
      // Safely access item property using type assertion
      const cellValue = column.key in item 
        ? (item as any)[column.key] 
        : undefined;

      return (
        <div
          style={style}
          className={`px-4 py-2 flex items-center ${column.className || ''} ${
            onRowClick ? 'cursor-pointer' : ''
          }`}
          onClick={() => onRowClick && onRowClick(item)}
        >
          {column.render ? column.render(item) : cellValue}
        </div>
      );
    },
    [columns, data, onRowClick]
  );

  // Render empty state if no data
  if (data.length === 0) {
    return (
      <div className={`optimized-data-grid-empty ${className}`}>
        No data available
      </div>
    );
  }

  return (
    <div className={`optimized-data-grid ${className}`} style={{ position: 'relative' }}>
      <FixedSizeGrid
        className="data-grid-window"
        columnCount={columns.length}
        columnWidth={fixedColumnWidth}
        height={height}
        rowCount={data.length + 1} // +1 for header row
        rowHeight={rowHeight}
        width={gridWidth}
      >
        {CellRenderer}
      </FixedSizeGrid>
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
export default React.memo(OptimizedDataGrid) as typeof OptimizedDataGrid; 