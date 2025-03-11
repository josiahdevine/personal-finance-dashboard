import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalPages?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: any;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}

export function usePaginatedData<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: PaginationOptions = {}
): PaginatedResult<T> {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
  } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Reset to page 1 when pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);
  
  // Fetch data with react-query
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['paginatedData', currentPage, pageSize],
    queryFn: () => fetchFunction(currentPage, pageSize),
  });
  
  // Calculate pagination values
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);
  
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);
  
  // Update page size with validation
  const updatePageSize = useCallback((size: number) => {
    if (size >= 5 && size <= 100) {
      setPageSize(size);
    }
  }, []);
  
  return {
    data: data?.data || [],
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      hasNextPage,
      hasPreviousPage,
    },
    isLoading,
    isError,
    error,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: updatePageSize,
  };
} 