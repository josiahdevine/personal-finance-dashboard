import { FinancialHealthScore, Status } from '../types';

const mockFinancialHealthScore: FinancialHealthScore = {
  overallScore: 75,
  statusSummary: 'good',
  components: {
    emergencySavings: {
      score: 80,
      status: 'good',
      recommendations: ['Build emergency fund to 6 months of expenses'],
    },
    debt: {
      score: 70,
      status: 'good',
      recommendations: ['Pay off high-interest credit card debt'],
    },
    retirement: {
      score: 85,
      status: 'excellent',
      recommendations: ['Consider increasing 401k contributions'],
    },
    spending: {
      score: 65,
      status: 'fair',
      recommendations: ['Reduce discretionary spending'],
    },
    insurance: {
      score: 90,
      status: 'excellent',
      recommendations: ['Review life insurance coverage'],
    },
    credit: {
      score: 75,
      status: 'good',
      recommendations: ['Keep credit utilization below 30%'],
    },
  },
  topRecommendations: [
    'Build emergency fund to 6 months of expenses',
    'Pay off high-interest credit card debt',
    'Reduce discretionary spending',
  ],
  historicalScores: [
    { date: '2024-01-01', score: 70 },
    { date: '2024-02-01', score: 72 },
    { date: '2024-03-01', score: 75 },
  ],
};

export const financialHealthService = {
  calculateFinancialHealthScore: jest.fn(async (userId: string): Promise<FinancialHealthScore> => {
    if (userId === 'non-existent-user') {
      // Return a lower score for non-existent user
      return {
        ...mockFinancialHealthScore,
        overallScore: 45,
        statusSummary: 'poor' as Status,
        components: {
          ...mockFinancialHealthScore.components,
          emergencySavings: {
            score: 30,
            status: 'poor',
            recommendations: ['Start building emergency fund immediately'],
          },
          debt: {
            score: 40,
            status: 'poor',
            recommendations: ['Create debt repayment plan'],
          },
        },
      };
    }
    return mockFinancialHealthScore;
  }),
}; 