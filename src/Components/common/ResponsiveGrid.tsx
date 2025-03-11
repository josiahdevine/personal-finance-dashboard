import React from 'react';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns: ResponsiveValue<number> | number;
  gap?: ResponsiveValue<number> | number;
  rowGap?: ResponsiveValue<number> | number;
  columnGap?: ResponsiveValue<number> | number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = 4,
  rowGap,
  columnGap,
  className = '',
}) => {
  // Convert responsive values to Tailwind classes
  const getColumnsClasses = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    
    const classes = [];
    if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
    
    return classes.join(' ');
  };
  
  const getGapClasses = () => {
    const gapClasses = [];
    
    // General gap (applies to both row and column)
    if (typeof gap === 'number') {
      gapClasses.push(`gap-${gap}`);
    } else if (gap) {
      if (gap.xs) gapClasses.push(`gap-${gap.xs}`);
      if (gap.sm) gapClasses.push(`sm:gap-${gap.sm}`);
      if (gap.md) gapClasses.push(`md:gap-${gap.md}`);
      if (gap.lg) gapClasses.push(`lg:gap-${gap.lg}`);
      if (gap.xl) gapClasses.push(`xl:gap-${gap.xl}`);
      if (gap['2xl']) gapClasses.push(`2xl:gap-${gap['2xl']}`);
    }
    
    // Row gap
    if (rowGap) {
      if (typeof rowGap === 'number') {
        gapClasses.push(`row-gap-${rowGap}`);
      } else {
        if (rowGap.xs) gapClasses.push(`row-gap-${rowGap.xs}`);
        if (rowGap.sm) gapClasses.push(`sm:row-gap-${rowGap.sm}`);
        if (rowGap.md) gapClasses.push(`md:row-gap-${rowGap.md}`);
        if (rowGap.lg) gapClasses.push(`lg:row-gap-${rowGap.lg}`);
        if (rowGap.xl) gapClasses.push(`xl:row-gap-${rowGap.xl}`);
        if (rowGap['2xl']) gapClasses.push(`2xl:row-gap-${rowGap['2xl']}`);
      }
    }
    
    // Column gap
    if (columnGap) {
      if (typeof columnGap === 'number') {
        gapClasses.push(`column-gap-${columnGap}`);
      } else {
        if (columnGap.xs) gapClasses.push(`column-gap-${columnGap.xs}`);
        if (columnGap.sm) gapClasses.push(`sm:column-gap-${columnGap.sm}`);
        if (columnGap.md) gapClasses.push(`md:column-gap-${columnGap.md}`);
        if (columnGap.lg) gapClasses.push(`lg:column-gap-${columnGap.lg}`);
        if (columnGap.xl) gapClasses.push(`xl:column-gap-${columnGap.xl}`);
        if (columnGap['2xl']) gapClasses.push(`2xl:column-gap-${columnGap['2xl']}`);
      }
    }
    
    return gapClasses.join(' ');
  };
  
  const gridClasses = [
    'grid',
    getColumnsClasses(),
    getGapClasses(),
    className
  ].join(' ');
  
  return <div className={gridClasses}>{children}</div>;
};

export default ResponsiveGrid; 