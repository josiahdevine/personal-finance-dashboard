import { api } from './api';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  parentId?: string;
}

interface CategoryRule {
  id: string;
  pattern: string;
  categoryId: string;
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response;
  }

  static async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>('/categories', categoryData);
    return response;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, updates);
    return response;
  }

  static async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }

  static async getCategoryRules(): Promise<CategoryRule[]> {
    const response = await api.get<CategoryRule[]>('/categories/rules');
    return response;
  }

  static async createCategoryRule(ruleData: Omit<CategoryRule, 'id'>): Promise<CategoryRule> {
    const response = await api.post<CategoryRule>('/categories/rules', ruleData);
    return response;
  }

  static async deleteCategoryRule(id: string): Promise<void> {
    await api.delete(`/categories/rules/${id}`);
  }

  static async suggestCategory(transactionName: string): Promise<{
    categoryId: string;
    confidence: number;
  }> {
    const response = await api.post('/categories/suggest', {
      transactionName
    });
    return response;
  }
} 