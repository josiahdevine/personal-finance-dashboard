import api from './api';
import type { Goal } from '../types/models';

interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline: string;
  type: 'savings' | 'debt' | 'investment';
}

interface UpdateGoalData {
  name?: string;
  targetAmount?: number;
  deadline?: string;
  type?: 'savings' | 'debt' | 'investment';
}

export class GoalService {
  static async getGoals(): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/api/goals');
    return response;
  }

  static async createGoal(data: CreateGoalData): Promise<Goal> {
    const response = await api.post<Goal>('/api/goals', data);
    return response;
  }

  static async updateGoal(id: string, data: UpdateGoalData): Promise<Goal> {
    const response = await api.patch<Goal>(`/api/goals/${id}`, data);
    return response;
  }

  static async deleteGoal(id: string): Promise<void> {
    await api.delete(`/api/goals/${id}`);
  }

  static async getGoalProgress(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/api/goals/${id}/progress`);
    return response;
  }

  static async getGoalProjections(id: string): Promise<{
    projectedCompletion: string;
    monthlyRequired: number;
    progressRate: number;
  }> {
    const response = await api.get<{
      projectedCompletion: string;
      monthlyRequired: number;
      progressRate: number;
    }>(`/api/goals/${id}/projections`);
    return response;
  }
}

interface GoalAnalysis {
  projectedCompletion: string;
  monthlyRequired: number;
  progressRate: number;
}

interface GoalRecommendations {
  savingsGoal: number;
  investmentGoal: number;
  emergencyFundGoal: number;
}

export const analyzeGoal = async (
  targetAmount: number,
  currentAmount: number,
  deadline: string,
  monthlyContribution: number
): Promise<GoalAnalysis> => {
  try {
    const response = await api.post<GoalAnalysis>('/goals/analyze', {
      targetAmount,
      currentAmount,
      deadline,
      monthlyContribution
    });
    return response;
  } catch (error) {
    console.error('Error analyzing goal:', error);
    throw error;
  }
};

export const updateGoalProgress = async (
  goalId: string,
  currentAmount: number
): Promise<void> => {
  try {
    await api.put(`/goals/${goalId}/progress`, { currentAmount });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
};

export const getGoalRecommendations = async (
  income: number,
  expenses: number,
  riskTolerance: 'low' | 'medium' | 'high'
): Promise<GoalRecommendations> => {
  try {
    const response = await api.post<GoalRecommendations>('/goals/recommendations', {
      income,
      expenses,
      riskTolerance
    });
    return response;
  } catch (error) {
    console.error('Error getting goal recommendations:', error);
    throw error;
  }
}; 