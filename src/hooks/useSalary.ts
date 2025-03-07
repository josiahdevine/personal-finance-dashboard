import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../context/NotificationContext';

// Define SalaryEntry type locally
interface SalaryEntry {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  deductions: {
    tax: number;
    retirement: number;
    insurance: number;
    other: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface SalaryAnalytics {
  currentSalary: SalaryEntry | null;
  salaryHistory: SalaryEntry[];
  salaryGrowth: {
    year: number;
    base_salary: number;
    total_compensation: number;
  }[];
  averageSalary: {
    average_base: number;
    average_total: number;
    count: number;
  } | null;
  stats: {
    totalYTD: number;
    monthlyAverage: number;
    yearOverYearGrowth: number;
  };
}

export const useSalary = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [error, setError] = useState<string | null>(null);

  // Fetch salary analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<SalaryAnalytics>({
    queryKey: ['salary-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/salary/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch salary analytics');
      }
      return response.json();
    },
  });

  // Fetch salary entries
  const { data: entries = [], isLoading: isLoadingEntries } = useQuery<SalaryEntry[]>({
    queryKey: ['salary-entries'],
    queryFn: async () => {
      const response = await fetch('/api/salary');
      if (!response.ok) {
        throw new Error('Failed to fetch salary entries');
      }
      return response.json();
    },
  });

  // Add salary entry
  const { mutate: addEntry } = useMutation({
    mutationFn: async (entry: Omit<SalaryEntry, 'id' | 'user_id'>) => {
      const response = await fetch('/api/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error('Failed to add salary entry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['salary-analytics'] });
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: 'Salary entry added successfully',
        type: 'success',
        timestamp: new Date(),
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: error.message,
        type: 'error',
        timestamp: new Date(),
      });
    },
  });

  // Update salary entry
  const { mutate: updateEntry } = useMutation({
    mutationFn: async ({ id, ...entry }: SalaryEntry) => {
      const response = await fetch(`/api/salary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error('Failed to update salary entry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['salary-analytics'] });
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: 'Salary entry updated successfully',
        type: 'success',
        timestamp: new Date(),
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: error.message,
        type: 'error',
        timestamp: new Date(),
      });
    },
  });

  // Delete salary entry
  const { mutate: deleteEntry } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/salary/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete salary entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['salary-analytics'] });
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: 'Salary entry deleted successfully',
        type: 'success',
        timestamp: new Date(),
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      notifications.addNotification?.({
        id: Date.now().toString(),
        message: error.message,
        type: 'error',
        timestamp: new Date(),
      });
    },
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addSalaryNotification = (message: string) => {
    notifications.addNotification?.({
      id: Date.now().toString(),
      message,
      type: 'success',
      timestamp: new Date(),
    });
  };

  return {
    analytics,
    entries,
    isLoading: isLoadingAnalytics || isLoadingEntries,
    error,
    clearError,
    addEntry,
    updateEntry,
    deleteEntry,
    addSalaryNotification,
  };
}; 