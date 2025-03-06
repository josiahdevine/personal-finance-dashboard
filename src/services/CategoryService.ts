import { api } from '../utils/api';
import type { Category, CreateCategoryData, UpdateCategoryData, CategoryRule } from '../types/models';

interface CategoryPrediction {
  categoryId: string;
  confidence: number;
}

export const predictCategory = async (
  description: string,
  amount: number,
  date: string
): Promise<CategoryPrediction> => {
  try {
    const { data } = await api.post<CategoryPrediction>('/categories/predict', {
      description,
      amount,
      date
    });
    return data;
  } catch (error) {
    console.error('Error predicting category:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const { data } = await api.get<string[]>('/categories');
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const updateCategory = async (
  transactionId: string,
  categoryId: string
): Promise<void> => {
  try {
    await api.put(`/transactions/${transactionId}/category`, {
      categoryId
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }

  static async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  }

  static async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  }

  static async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }

  static async getCategoryRules(categoryId: string): Promise<CategoryRule[]> {
    const response = await api.get<CategoryRule[]>(`/api/categories/${categoryId}/rules`);
    return response.data;
  }

  static async createCategoryRule(categoryId: string, pattern: string): Promise<CategoryRule> {
    const response = await api.post<CategoryRule>(`/api/categories/${categoryId}/rules`, {
      pattern,
      categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  }

  static async deleteCategoryRule(categoryId: string, ruleId: string): Promise<void> {
    await api.delete(`/api/categories/${categoryId}/rules/${ruleId}`);
  }

  static async predictCategory(description: string): Promise<{ categoryId: string; confidence: number }> {
    const response = await api.post<{ categoryId: string; confidence: number }>('/api/categories/predict', {
      description
    });
    return response.data;
  }
} 