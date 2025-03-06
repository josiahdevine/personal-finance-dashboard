import { portfolioAnalysisService } from '../../services/PortfolioAnalysisService';

describe('Portfolio Analysis System', () => {
  const testUserId = 'test-user-123';
  const testAccountIds = ['account-1', 'account-2'];

  const _mockHoldings = [
    {
      securityId: 'sec-1',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      value: 10000,
      quantity: 50,
      price: 200,
      costBasis: 8000
    },
    {
      securityId: 'sec-2',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      value: 15000,
      quantity: 10,
      price: 1500,
      costBasis: 12000
    },
    {
      securityId: 'sec-3',
      ticker: 'CASH',
      name: 'Cash',
      value: 5000,
      quantity: 5000,
      price: 1,
      costBasis: 5000
    }
  ];

  describe('Portfolio Analysis', () => {
    test('should calculate total portfolio value correctly', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      expect(analysis.totalValue).toBe(30000); // Sum of all holdings
      expect(analysis.cashValue).toBe(5000); // Cash holding
      expect(analysis.investedValue).toBe(25000); // Non-cash holdings
    });

    test('should calculate gains correctly', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      const totalGain = analysis.totalGain;
      const expectedGain = (10000 - 8000) + (15000 - 12000) + (5000 - 5000);
      expect(totalGain).toBe(expectedGain);
    });

    test('should calculate asset allocation correctly', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      const assetAllocation = analysis.assetAllocation;
      expect(assetAllocation).toHaveLength(2); // Stocks and Cash

      const stocks = assetAllocation.find(a => a.assetClass === 'Stocks');
      const cash = assetAllocation.find(a => a.assetClass === 'Cash');

      expect(stocks?.percentage).toBe((25000 / 30000) * 100);
      expect(cash?.percentage).toBe((5000 / 30000) * 100);
    });

    test('should calculate sector allocation correctly', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      const sectorAllocation = analysis.sectorAllocation;
      expect(sectorAllocation).toHaveLength(2); // Technology and Cash

      const tech = sectorAllocation.find(s => s.sector === 'Technology');
      expect(tech?.value).toBe(25000);
      expect(tech?.percentage).toBe((25000 / 30000) * 100);
    });
  });

  describe('Risk Metrics', () => {
    test('should calculate risk metrics', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      const { riskMetrics } = analysis;
      expect(riskMetrics.sharpeRatio).toBeDefined();
      expect(riskMetrics.beta).toBeDefined();
      expect(riskMetrics.alpha).toBeDefined();
      expect(riskMetrics.standardDeviation).toBeDefined();
      expect(riskMetrics.maxDrawdown).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    test('should calculate performance metrics', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );

      const { performanceMetrics } = analysis;
      expect(performanceMetrics.daily).toBeDefined();
      expect(performanceMetrics.weekly).toBeDefined();
      expect(performanceMetrics.monthly).toBeDefined();
      expect(performanceMetrics.ytd).toBeDefined();
      expect(performanceMetrics.oneYear).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing user ID', async () => {
      await expect(
        portfolioAnalysisService.getPortfolioAnalysis('')
      ).rejects.toThrow();
    });

    test('should handle empty account list', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        []
      );

      expect(analysis.totalValue).toBe(0);
      expect(analysis.assetAllocation).toHaveLength(0);
      expect(analysis.sectorAllocation).toHaveLength(0);
    });

    test('should handle invalid account IDs', async () => {
      const analysis = await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        ['invalid-account']
      );

      expect(analysis.totalValue).toBe(0);
      expect(analysis.securities).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    test('should complete analysis quickly', async () => {
      const start = Date.now();
      
      await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        testAccountIds
      );
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    test('should handle large portfolios efficiently', async () => {
      // Create a large portfolio with 1000 holdings
      const largeAccountIds = Array(1000)
        .fill(null)
        .map((_, i) => `account-${i}`);
      
      const start = Date.now();
      
      await portfolioAnalysisService.getPortfolioAnalysis(
        testUserId,
        largeAccountIds
      );
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should complete within 2s
    });
  });
}); 