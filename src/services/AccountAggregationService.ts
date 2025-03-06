import { PlaidService } from './PlaidService';

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

interface PlaidAccountResponse {
  account_id: string;
  name: string;
  type: string;
  balances: {
    current: number;
    available?: number;
    iso_currency_code: string;
  };
  institution_name: string;
}

export class AccountAggregationService {
  private static instance: AccountAggregationService;
  private plaidService: PlaidService;

  private constructor() {
    this.plaidService = new PlaidService();
  }

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
        this.aggregatePlaidAccounts(userId)
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
      const response = await fetch(`/api/manual-accounts/${userId}`);
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
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching manual accounts:', error);
      return [];
    }
  }

  private async aggregatePlaidAccounts(userId: string): Promise<AggregatedAccount[]> {
    try {
      const plaidAccounts = await this.plaidService.getAccounts(userId) as PlaidAccountResponse[];
      return plaidAccounts.map((account) => ({
        id: account.account_id,
        name: account.name,
        type: account.type,
        balance: {
          current: account.balances.current || 0,
          available: account.balances.available
        },
        currency: account.balances.iso_currency_code || 'USD',
        source: 'plaid' as const,
        institution: account.institution_name,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching Plaid accounts:', error);
      return [];
    }
  }

  async refreshAllData(userId: string): Promise<void> {
    try {
      // Refresh Plaid data
      await this.plaidService.refreshAccountBalances(userId);
      await this.plaidService.syncTransactions(userId);
    } catch (error) {
      console.error('Error refreshing account data:', error);
      throw error;
    }
  }
} 