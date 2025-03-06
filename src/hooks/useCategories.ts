import { useState, useCallback, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { CategoryService } from '../services/CategoryService';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../types/models';

interface CategoryFilters {
  parentId?: string;
  isCustom?: boolean;
  isHidden?: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<CategoryFilters>({});

  const {
    execute: fetchCategories,
    isLoading: loadingCategories,
    error: loadError
  } = useAsyncAction<never[], Category[]>(async () => {
    const data = await CategoryService.getCategories();
    setCategories(data);
    return data;
  });

  const {
    execute: createCategory,
    isLoading: addingCategory,
    error: addError
  } = useAsyncAction<[CreateCategoryData], Category>(async (categoryData) => {
    const newCategory = await CategoryService.createCategory(categoryData);
    setCategories(prevCategories => [...prevCategories, newCategory]);
    return newCategory;
  });

  const {
    execute: updateCategory,
    isLoading: updatingCategory,
    error: updateError
  } = useAsyncAction<[string, UpdateCategoryData], Category>(async (id, categoryData) => {
    const updatedCategory = await CategoryService.updateCategory(id, categoryData);
    setCategories(prevCategories => prevCategories.map(cat => cat.id === id ? updatedCategory : cat));
    return updatedCategory;
  });

  const {
    execute: deleteCategory,
    isLoading: removingCategory,
    error: removeError
  } = useAsyncAction<[string], void>(async (id) => {
    await CategoryService.deleteCategory(id);
    setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
  });

  const updateFilters = useCallback((newFilters: CategoryFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const getCategoryHierarchy = useCallback((categoryId: string): Category[] => {
    const hierarchy: Category[] = [];
    let current = getCategoryById(categoryId);
    
    while (current) {
      hierarchy.unshift(current);
      current = current.parentId ? getCategoryById(current.parentId) : undefined;
    }
    
    return hierarchy;
  }, [getCategoryById]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    filters,
    loadingCategories,
    addingCategory,
    updatingCategory,
    removingCategory,
    loadError,
    addError,
    updateError,
    removeError,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    clearFilters,
    getCategoryById,
    getCategoryHierarchy,
  };
} 