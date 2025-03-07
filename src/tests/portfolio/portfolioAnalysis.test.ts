import { getPortfolioSummary } from '../../services/PortfolioAnalysisService';

// Mock the API call
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockImplementation((url) => {
      if (url === '/portfolio/summary') {
        return Promise.resolve({
          data: {
            totalValue: 30000,
            totalGain: 5000,
            totalGainPercent: 20,
            dayChange: 500,
            dayChangePercent: 1.7,
            cashValue: 5000,
            riskMetrics: {
              sharpeRatio: 1.2,
              beta: 0.85,
              alpha: 2.5,
              standardDeviation: 15.3,
              maxDrawdown: 12.5,
              volatility: 14.2
            },
            assetAllocation: [
              {
                name: 'Stocks',
                assetClass: 'equity',
                value: 20000,
                percentage: 66.67,
                securities: []
              },
              {
                name: 'Bonds',
                assetClass: 'fixed-income',
                value: 5000,
                percentage: 16.67,
                securities: []
              },
              {
                name: 'Cash',
                assetClass: 'cash',
                value: 5000,
                percentage: 16.67,
                securities: []
              }
            ]
          }
        });
      }
      return Promise.reject(new Error('Not found'));
    })
  }
}));

describe('Portfolio Analysis System', () => {
  describe('Portfolio Analysis', () => {
    test('should calculate total portfolio value correctly', async () => {
      const analysis = await getPortfolioSummary();
      expect(analysis.totalValue).toBe(30000);
    });

    test('should calculate gains correctly', async () => {
      const analysis = await getPortfolioSummary();
      expect(analysis.totalGain).toBe(5000);
      expect(analysis.totalGainPercent).toBe(20);
    });

    test('should calculate asset allocation correctly', async () => {
      const analysis = await getPortfolioSummary();
      expect(analysis.assetAllocation.length).toBe(3);
      expect(analysis.assetAllocation[0].name).toBe('Stocks');
      expect(analysis.assetAllocation[0].percentage).toBeCloseTo(66.67);
    });
  });

  describe('Risk Metrics', () => {
    test('should calculate risk metrics', async () => {
      const analysis = await getPortfolioSummary();
      expect(analysis.riskMetrics.sharpeRatio).toBeCloseTo(1.2);
      expect(analysis.riskMetrics.beta).toBeCloseTo(0.85);
      expect(analysis.riskMetrics.volatility).toBeCloseTo(14.2);
    });
  });
}); 