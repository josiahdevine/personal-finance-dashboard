import PlaidService from '../lower-components/plaidService';

export interface AccountBalance {
  available: number;
  current: number;
  isoCurrencyCode: string;
  unofficialCurrencyCode: string | null;
}

export interface Account {
  account_id: string;
  balances: AccountBalance;
  mask: string | null;
  name: string;
  official_name: string | null;
  subtype: string | null;
  type: string;
  institution: string;
}

export interface Balance {
  current: number;
  available?: number;
}

export interface AggregatedAccount {
  id: string;
  name: string;
  type: string;
  balance: Balance;
  currency: string;
  source: 'plaid' | 'manual';
  institution?: string;
  lastUpdated?: Date;
}

export interface AccountSummary {
  totalBalance: number;
  totalDebt: number;
  netWorth: number;
  accountsByType: {
    [key: string]: {
      count: number;
      totalBalance: number;
    };
  };
  institutions: Array<{
    name: string;
    accountCount: number;
    totalBalance: number;
  }>;
}

interface ManualAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export class AccountAggregationService {
  private static instance: AccountAggregationService;

  public static getInstance(): AccountAggregationService {
    if (!AccountAggregationService.instance) {
      AccountAggregationService.instance = new AccountAggregationService();
    }
    return AccountAggregationService.instance;
  }

  public async getAllAccounts(userId: string): Promise<AggregatedAccount[]> {
    try {
      const [manualAccounts, plaidAccounts] = await Promise.all([
        this.aggregateManualAccounts(userId),
        this.aggregatePlaidAccounts()
      ]);

      return [...manualAccounts, ...plaidAccounts];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getAccountSummary(userId: string): Promise<AccountSummary> {
    const accounts = await this.getAllAccounts(userId);
    
    const summary: AccountSummary = {
      totalBalance: 0,
      totalDebt: 0,
      netWorth: 0,
      accountsByType: {},
      institutions: [],
    };

    const institutionMap = new Map<string, { accountCount: number; totalBalance: number }>();

    accounts.forEach(account => {
      const balance = account.balance.current;
      const isDebt = account.type === 'credit' || account.type === 'loan';

      // Update total balances
      if (isDebt) {
        summary.totalDebt += balance;
      } else {
        summary.totalBalance += balance;
      }

      // Update account type statistics
      const typeStats = summary.accountsByType[account.type] || { count: 0, totalBalance: 0 };
      typeStats.count++;
      typeStats.totalBalance += balance;
      summary.accountsByType[account.type] = typeStats;

      // Update institution statistics
      const institution = account.institution || 'Manual Entry';
      const institutionStats = institutionMap.get(institution) || { accountCount: 0, totalBalance: 0 };
      institutionStats.accountCount++;
      institutionStats.totalBalance += balance;
      institutionMap.set(institution, institutionStats);
    });

    summary.netWorth = summary.totalBalance - summary.totalDebt;
    summary.institutions = Array.from(institutionMap.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    }));

    return summary;
  }

  private async aggregateManualAccounts(userId: string): Promise<AggregatedAccount[]> {
    try {
      // Updated endpoint path to match test expectations
      const response = await fetch(`/api/accounts/manual/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch manual accounts');
      }
      const accounts = await response.json() as ManualAccount[];
      return accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: {
          current: account.balance,
          available: account.balance
        },
        currency: account.currency,
        source: 'manual' as const,
        // Include institution for consistency
        institution: 'Manual Entry',
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching manual accounts:', error);
      return [];
    }
  }

  private async aggregatePlaidAccounts(): Promise<AggregatedAccount[]> {
    try {
      const plaidAccounts = await PlaidService.getAccounts();
      return plaidAccounts.map((account: any) => {
        // Create a properly structured AggregatedAccount
        const aggregatedAccount: AggregatedAccount = {
          id: account.account_id || account.id || `plaid-${Math.random().toString(36).substring(2, 10)}`,
          name: account.name || 'Unnamed Account',
          type: account.type || 'depository',
          balance: {
            current: account.balance || account.balances?.current || 0,
            available: account.available_balance || account.balances?.available || account.balance || 0
          },
          currency: account.currency_code || account.balances?.isoCurrencyCode || 'USD',
          source: 'plaid' as const,
          institution: account.institution_name || account.institution || 'Unknown Institution',
          lastUpdated: new Date()
        };
        return aggregatedAccount;
      });
    } catch (error) {
      console.error('Error fetching Plaid accounts:', error);
      return [];
    }
  }
}