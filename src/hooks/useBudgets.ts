import { useState, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { BudgetService } from '../services/BudgetService';
import { Budget, CreateBudgetData, UpdateBudgetData } from '../types/models';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const {
    execute: fetchBudgets,
    isLoading: loadingBudgets,
    error: loadError
  } = useAsyncAction<[], Budget[]>(async () => {
    const data = await BudgetService.getBudgets();
    setBudgets(data);
    return data;
  });

  const {
    execute: addBudget,
    isLoading: addingBudget,
    error: addError
  } = useAsyncAction<[CreateBudgetData], Budget>(async (budgetData) => {
    const newBudget = await BudgetService.createBudget(budgetData);
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  });

  const {
    execute: updateBudget,
    isLoading: updatingBudget,
    error: updateError
  } = useAsyncAction<[string, UpdateBudgetData], Budget>(async (id, budgetData) => {
    const updatedBudget = await BudgetService.updateBudget(id, budgetData);
    setBudgets(prev => prev.map(budget => budget.id === id ? updatedBudget : budget));
    return updatedBudget;
  });

  const {
    execute: removeBudget,
    isLoading: removingBudget,
    error: removeError
  } = useAsyncAction<[string], void>(async (id) => {
    await BudgetService.deleteBudget(id);
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  });

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loadingBudgets,
    addingBudget,
    updatingBudget,
    removingBudget,
    loadError,
    addError,
    updateError,
    removeError,
    addBudget,
    updateBudget,
    removeBudget
  };
} 