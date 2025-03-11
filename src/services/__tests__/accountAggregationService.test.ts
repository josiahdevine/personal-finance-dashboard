import { AccountAggregationService } from '../AccountAggregationService';
import PlaidService from '../PlaidService';
import { Account } from '../../types/models';

jest.mock('../PlaidService', () => ({
  __esModule: true,
  default: {
    getAccounts: jest.fn()
  }
}));

global.fetch = jest.fn();

describe('AccountAggregationService', () => {
  let service: AccountAggregationService;
  const userId = 'user123';

  const mockManualAccounts: Account[] = [
    {
      id: 'manual1',
      userId: 'user123',
      name: 'Savings Account',
      type: 'savings',
      balance: 5000,
      currency: 'USD',
      institution: 'Manual Entry',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'manual2',
      userId: 'user123',
      name: 'Checking Account',
      type: 'checking',
      balance: 2500,
      currency: 'USD',
      institution: 'Manual Entry',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockPlaidAccounts: Account[] = [
    {
      id: 'plaid1',
      plaidAccountId: 'plaid-acc-1',
      userId: 'user123',
      name: 'Plaid Savings',
      officialName: 'Plaid Banking Savings',
      type: 'savings',
      subtype: 'savings',
      institutionId: 'inst1',
      institutionName: 'Plaid Bank',
      balance: {
        current: 10000,
        available: 9500,
        limit: null,
        isoCurrencyCode: 'USD',
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'plaid2',
      plaidAccountId: 'plaid-acc-2',
      userId: 'user123',
      name: 'Plaid Checking',
      officialName: 'Plaid Banking Checking',
      type: 'checking',
      subtype: 'checking',
      institutionId: 'inst1',
      institutionName: 'Plaid Bank',
      balance: {
        current: 5000,
        available: 4800,
        limit: null,
        isoCurrencyCode: 'USD',
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountAggregationService();
  });

  describe('getAllAccounts', () => {
    it('should return combined manual and plaid accounts', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/accounts/manual') && url.includes(userId)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockManualAccounts)
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      (PlaidService.getAccounts as jest.Mock).mockResolvedValue(mockPlaidAccounts);

      const accounts = await service.getAllAccounts(userId);

      expect(accounts.length).toBe(4);
      expect(accounts.find(a => a.id === 'manual1')).toBeDefined();
      expect(accounts.find(a => a.id === 'plaid-acc-1')).toBeDefined();
      expect(accounts.filter(a => a.source === 'manual').length).toBe(2);
      expect(accounts.filter(a => a.source === 'plaid').length).toBe(2);
    });

    it('should handle errors and return an empty array', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      (PlaidService.getAccounts as jest.Mock).mockRejectedValue(new Error('Plaid API error'));

      const accounts = await service.getAllAccounts(userId);

      expect(accounts).toEqual([]);
    });
  });

  describe('getAccountSummary', () => {
    it('should calculate correct summary from all accounts', async () => {
      jest.spyOn(service, 'getAllAccounts').mockResolvedValue([
        {
          id: 'manual1',
          name: 'Savings Account',
          type: 'savings',
          balance: {
            current: 5000,
            available: 5000
          },
          currency: 'USD',
          source: 'manual',
        },
        {
          id: 'plaid-acc-1',
          name: 'Plaid Savings',
          type: 'savings',
          balance: {
            current: 10000,
            available: 9500
          },
          currency: 'USD',
          source: 'plaid',
          institution: 'Plaid Bank',
        }
      ]);

      const summary = await service.getAccountSummary(userId);

      expect(summary.totalAssets).toBe(15000);
      expect(summary.accounts.length).toBe(2);
      expect(summary.accounts[0].balance.current).toBe(5000);
      expect(summary.accounts[1].balance.current).toBe(10000);
    });
  });

  describe('aggregateManualAccounts', () => {
    it('should transform manual accounts to aggregated format', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/accounts/manual') && url.includes(userId)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockManualAccounts)
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await service['aggregateManualAccounts'](userId);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 'manual1',
        name: 'Savings Account',
        type: 'savings',
        balance: {
          current: 5000,
          available: 5000
        },
        currency: 'USD',
        source: 'manual'
      });
    });
  });

  describe('aggregatePlaidAccounts', () => {
    it('should transform plaid accounts to aggregated format', async () => {
      (PlaidService.getAccounts as jest.Mock).mockResolvedValue(mockPlaidAccounts);

      const result = await service['aggregatePlaidAccounts'](userId);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 'plaid-acc-1',
        name: 'Plaid Savings',
        type: 'savings',
        balance: {
          current: 10000,
          available: 9500
        },
        currency: 'USD',
        source: 'plaid',
        institution: 'Plaid Bank'
      });
    });
  });
});
