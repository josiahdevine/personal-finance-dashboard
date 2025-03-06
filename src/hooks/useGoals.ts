import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types/models';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/goals');
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (!response.ok) {
        throw new Error('Failed to add goal');
      }
      const newGoal = await response.json();
      setGoals(prev => [...prev, newGoal]);
      setError(null);
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update goal');
      }
      const updatedGoal = await response.json();
      setGoals(prev =>
        prev.map(goal => (goal.id === id ? { ...goal, ...updatedGoal } : goal))
      );
      setError(null);
      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }
      setGoals(prev => prev.filter(goal => goal.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: fetchGoals
  };
}; 