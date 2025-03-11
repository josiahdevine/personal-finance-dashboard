import React from 'react';
import './Grid.css';

export interface GridProps {
  children: React.ReactNode;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  className?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap,
  rowGap,
  columnGap,
  className = '',
}) => {
  // Construct class names for responsive columns
  const colClasses = Object.entries(columns)
    .map(([breakpoint, count]) => `grid-cols-${breakpoint}-${count}`)
    .join(' ');
  
  // Style attribute for gaps
  const style: React.CSSProperties = {};
  if (gap) style.gap = gap;
  if (rowGap) style.rowGap = rowGap;
  if (columnGap) style.columnGap = columnGap;
  
  return (
    <div className={`grid ${colClasses} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Grid; 