import { AccountAggregationService } from '../AccountAggregationService';
import PlaidService from '../../lower-components/plaidService';
import { Account } from '../../types/models';

jest.mock('../plaidService', () => ({
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

  const mockPlaidAccounts = [
    {
      id: 'plaid1',
      plaid_account_id: 'plaid-acc-1',
      name: 'Plaid Savings',
      official_name: 'Plaid Banking Savings',
      type: 'savings',
      subtype: 'savings',
      balance: 10000,
      available_balance: 9500,
      limit_amount: null,
      currency_code: 'USD',
      mask: '1234',
      institution_name: 'Plaid Bank',
      institution_color: '#0000FF',
      institution_logo: null
    },
    {
      id: 'plaid2',
      plaid_account_id: 'plaid-acc-2',
      name: 'Plaid Checking',
      official_name: 'Plaid Banking Checking',
      type: 'checking',
      subtype: 'checking',
      balance: 5000,
      available_balance: 4800,
      limit_amount: null,
      currency_code: 'USD',
      mask: '5678',
      institution_name: 'Plaid Bank',
      institution_color: '#0000FF',
      institution_logo: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountAggregationService();
  });

  describe('getAllAccounts', () => {
    it('should return combined manual and plaid accounts', async () => {
      // Mock the manual accounts fetch response
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/accounts/manual') && url.includes(userId)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockManualAccounts)
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      // Mock PlaidService.getAccounts
      (PlaidService.getAccounts as jest.Mock).mockResolvedValue(mockPlaidAccounts);

      const accounts = await service.getAllAccounts(userId);

      // Check the length - should have 2 manual + 2 plaid
      expect(accounts.length).toBe(4);
      
      // Find a manual account by ID
      const manualAccount = accounts.find(a => a.id === 'manual1');
      expect(manualAccount).toBeDefined();
      expect(manualAccount?.source).toBe('manual');
      
      // Find a plaid account by ID
      const plaidAccount = accounts.find(a => a.id === 'plaid-acc-1');
      expect(plaidAccount).toBeDefined();
      expect(plaidAccount?.source).toBe('plaid');
      
      // Check source distribution
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

      expect(summary.totalBalance).toBe(15000);
      expect(summary.accountsByType.savings).toBeDefined();
      expect(summary.accountsByType.savings.count).toBe(2);
      expect(summary.accountsByType.savings.totalBalance).toBe(15000);
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
      // Mock the PlaidService.getAccounts response
      (PlaidService.getAccounts as jest.Mock).mockResolvedValue(mockPlaidAccounts);

      const result = await service['aggregatePlaidAccounts']();

      expect(result.length).toBe(2);
      // Check just the essential fields since Date objects will not match exactly in equality check
      expect(result[0].id).toBe('plaid-acc-1');
      expect(result[0].name).toBe('Plaid Savings');
      expect(result[0].type).toBe('savings');
      expect(result[0].balance.current).toBe(10000);
      expect(result[0].balance.available).toBe(9500);
      expect(result[0].currency).toBe('USD');
      expect(result[0].source).toBe('plaid');
      expect(result[0].institution).toBe('Plaid Bank');
      // Verify lastUpdated is a Date object
      expect(result[0].lastUpdated).toBeInstanceOf(Date);
    });
  });
});
