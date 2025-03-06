import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  currency: string;
  period: 'monthly' | 'yearly';
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  currency: string;
}

export const useBudget = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBudget = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [categoriesResponse, summaryResponse] = await Promise.all([
        fetch('/api/budget/categories'),
        fetch('/api/budget/summary'),
      ]);

      if (!categoriesResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const [categoriesData, summaryData] = await Promise.all([
        categoriesResponse.json(),
        summaryResponse.json(),
      ]);

      setCategories(categoriesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBudgetCategory = useCallback(async (categoryId: string, updates: Partial<BudgetCategory>) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/budget/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget category');
      }

      const updatedCategory = await response.json();
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? updatedCategory : cat
        )
      );

      // Refresh summary after update
      fetchBudget();
    } catch (err) {
      console.error('Error updating budget category:', err);
      throw err;
    }
  }, [user, fetchBudget]);

  const addBudgetCategory = useCallback(async (newCategory: Omit<BudgetCategory, 'id' | 'spent'>) => {
    if (!user) return;
    try {
      const response = await fetch('/api/budget/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error('Failed to add budget category');
      }

      const addedCategory = await response.json();
      setCategories(prev => [...prev, addedCategory]);
      
      // Refresh summary after adding new category
      fetchBudget();
    } catch (err) {
      console.error('Error adding budget category:', err);
      throw err;
    }
  }, [user, fetchBudget]);

  return {
    categories,
    summary,
    loading,
    error,
    fetchBudget,
    updateBudgetCategory,
    addBudgetCategory,
  };
}; 