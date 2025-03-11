import { useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

interface PageData<T> {
  data: T[];
  nextPage: number | null;
}

interface UseInfiniteScrollOptions<T> {
  queryKey: any[];
  fetchFn: (pageParam: number) => Promise<PageData<T>>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useInfiniteScroll<T>({
  queryKey,
  fetchFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
}: UseInfiniteScrollOptions<T>) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PageData<T>) => lastPage.nextPage,
    enabled,
    staleTime,
    gcTime: cacheTime,
  });
  
  // Flatten the pages data
  const items = data?.pages.flatMap((page: PageData<T>) => page.data) || [];
  
  // Setup intersection observer for infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );
  
  // Set up the intersection observer
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;
    
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);
  
  return {
    items,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    loadMoreRef,
    fetchNextPage
  };
} 