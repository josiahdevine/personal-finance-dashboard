import { financialHealthService } from '../financialHealthService';
import { ComponentScore } from '../types';

describe('Financial Health Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFinancialHealthScore', () => {
    it('should calculate overall financial health score', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeDefined();
      expect(result.statusSummary).toBeDefined();
      expect(result.components).toBeDefined();
      expect(result.topRecommendations).toBeDefined();
      expect(result.historicalScores).toBeDefined();
    });

    it('should include all required component scores', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);

      expect(result.components.emergencySavings).toBeDefined();
      expect(result.components.debt).toBeDefined();
      expect(result.components.retirement).toBeDefined();
      expect(result.components.spending).toBeDefined();
      expect(result.components.insurance).toBeDefined();
      expect(result.components.credit).toBeDefined();
    });

    it('should provide recommendations based on scores', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);

      expect(result.topRecommendations.length).toBeGreaterThan(0);
      expect(Array.isArray(result.topRecommendations)).toBe(true);
    });

    it('should calculate status based on score ranges', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);

      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.statusSummary);
      
      // Check component statuses
      Object.values(result.components).forEach((component: ComponentScore) => {
        expect(['excellent', 'good', 'fair', 'poor']).toContain(component.status);
      });
    });

    it('should handle missing user data gracefully', async () => {
      const userId = 'non-existent-user';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);

      expect(result.overallScore).toBeDefined();
      expect(result.statusSummary).toBeDefined();
      expect(result.components).toBeDefined();
      expect(result.topRecommendations).toBeDefined();
      expect(result.historicalScores).toBeDefined();
    });

    it('should calculate emergency savings score correctly', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);
      const { emergencySavings } = result.components;

      expect(emergencySavings.score).toBeGreaterThanOrEqual(0);
      expect(emergencySavings.score).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(emergencySavings.status);
      expect(Array.isArray(emergencySavings.recommendations)).toBe(true);
    });

    it('should calculate debt score correctly', async () => {
      const userId = 'test-user-id';
      const result = await financialHealthService.calculateFinancialHealthScore(userId);
      const { debt } = result.components;

      expect(debt.score).toBeGreaterThanOrEqual(0);
      expect(debt.score).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(debt.status);
      expect(Array.isArray(debt.recommendations)).toBe(true);
    });
  });
}); 