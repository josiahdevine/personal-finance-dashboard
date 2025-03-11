import { BudgetService } from '../BudgetService';
import api from '../api';
import { Budget, CreateBudgetData, UpdateBudgetData, BudgetAlert } from '../../types/models';

// Mock the api service
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}));

describe('BudgetService', () => {
  const mockBudget: Budget = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Budget',
    amount: 1000,
    spent: 750,
    remaining: 250,
    categoryId: 'category123',
    period: 'monthly' as const,
    startDate: '2023-01-01',
    endDate: '2023-01-31',
    isRecurring: false,
    userId: 'user123',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockBudgets: Budget[] = [
    mockBudget,
    {
      ...mockBudget,
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Test Budget 2',
      amount: 2000,
      spent: 1200,
      remaining: 800
    }
  ];

  const mockBudgetAnalytics = [
    {
      category: 'Groceries',
      budgeted: 500,
      spent: 350,
      remaining: 150,
      percentageUsed: 70
    },
    {
      category: 'Entertainment',
      budgeted: 300,
      spent: 275,
      remaining: 25,
      percentageUsed: 91.67
    }
  ];

  const mockBudgetHistory = [
    { date: '2023-01-01', amount: 250 },
    { date: '2023-01-15', amount: 350 },
    { date: '2023-01-31', amount: 400 }
  ];

  const mockBudgetAlerts: BudgetAlert[] = [
    {
      id: 'alert123',
      budgetId: '123e4567-e89b-12d3-a456-426614174000',
      type: 'warning',
      message: 'You have spent 70% of your Groceries budget',
      threshold: 70,
      createdAt: '2023-01-20T00:00:00Z',
      updatedAt: '2023-01-20T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBudgets', () => {
    it('should fetch all budgets', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBudgets);

      const result = await BudgetService.getBudgets();

      expect(api.get).toHaveBeenCalledWith('/api/budgets');
      expect(result).toEqual(mockBudgets);
    });

    it('should handle errors when fetching budgets', async () => {
      const errorMsg = 'Network error';
      (api.get as jest.Mock).mockRejectedValue(new Error(errorMsg));

      await expect(BudgetService.getBudgets()).rejects.toThrow(errorMsg);
    });
  });

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      (api.post as jest.Mock).mockResolvedValue(mockBudget);

      const budgetData: CreateBudgetData = {
        name: 'Test Budget',
        amount: 1000,
        categoryId: 'category123',
        period: 'monthly',
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        isRecurring: false
      };

      const result = await BudgetService.createBudget(budgetData);

      expect(api.post).toHaveBeenCalledWith('/api/budgets', budgetData);
      expect(result).toEqual(mockBudget);
    });
  });

  describe('updateBudget', () => {
    it('should update an existing budget', async () => {
      const updatedBudget = { ...mockBudget, amount: 1500, spent: 750, remaining: 750 };
      (api.patch as jest.Mock).mockResolvedValue(updatedBudget);

      const budgetId = mockBudget.id;
      const updates: UpdateBudgetData = { amount: 1500 };

      const result = await BudgetService.updateBudget(budgetId, updates);

      expect(api.patch).toHaveBeenCalledWith(`/api/budgets/${budgetId}`, updates);
      expect(result).toEqual(updatedBudget);
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget', async () => {
      (api.delete as jest.Mock).mockResolvedValue(undefined);

      const budgetId = mockBudget.id;
      await BudgetService.deleteBudget(budgetId);

      expect(api.delete).toHaveBeenCalledWith(`/api/budgets/${budgetId}`);
    });
  });

  describe('getBudgetAnalytics', () => {
    it('should fetch budget analytics', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBudgetAnalytics);

      const budgetId = mockBudget.id;
      const result = await BudgetService.getBudgetAnalytics(budgetId);

      expect(api.get).toHaveBeenCalledWith(`/api/budgets/${budgetId}/analytics`);
      expect(result).toEqual(mockBudgetAnalytics);
    });
  });

  describe('getBudgetHistory', () => {
    it('should fetch budget history', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBudgetHistory);

      const budgetId = mockBudget.id;
      const result = await BudgetService.getBudgetHistory(budgetId);

      expect(api.get).toHaveBeenCalledWith(`/api/budgets/${budgetId}/history`);
      expect(result).toEqual(mockBudgetHistory);
    });
  });

  describe('getBudgetAlerts', () => {
    it('should fetch budget alerts', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBudgetAlerts);

      const result = await BudgetService.getBudgetAlerts();

      expect(api.get).toHaveBeenCalledWith('/api/budgets/alerts');
      expect(result).toEqual(mockBudgetAlerts);
    });
  });

  describe('getBudgetProgress', () => {
    it('should fetch budget progress for a specific month', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBudgetAnalytics);

      const month = '2023-01';
      const result = await BudgetService.getBudgetProgress(month);

      expect(api.get).toHaveBeenCalledWith('/api/budgets/progress', {
        params: { month }
      });
      expect(result).toEqual(mockBudgetAnalytics);
    });
  });
});
