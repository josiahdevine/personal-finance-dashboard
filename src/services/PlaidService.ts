import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { PlaidAccount, Transaction } from '../types/models';
import { PlaidAccountResponse, PlaidTransactionResponse, PlaidTransaction } from '../types/plaid';
import api from './axiosConfig';
import { prisma } from '../lib/prisma';

interface PlaidBill {
  bill_id: string;
  account_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  status: 'paid' | 'pending' | 'overdue';
  last_payment_date?: string;
  next_payment_date?: string;
}

export class PlaidService {
  private client: PlaidApi;

  constructor() {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.NEXT_PUBLIC_PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.NEXT_PUBLIC_PLAID_SECRET,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  async createLinkToken(userId: string): Promise<string> {
    try {
      const response = await api.post('/plaid/create-link-token', { userId });
      return response.data.linkToken;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  async exchangePublicToken(publicToken: string): Promise<void> {
    try {
      await api.post('/plaid/exchange-token', { publicToken });
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  async getAccounts(userId: string): Promise<PlaidAccount[]> {
    try {
      const response = await this.client.accountsGet({
        access_token: await this.getAccessToken(userId),
      });

      return response.data.accounts.map(account => ({
        userId,
        plaidAccountId: account.account_id,
        id: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        isoCurrencyCode: account.balances.iso_currency_code || 'USD',
        institutionId: account.account_id.split('_')[0],
        institutionName: 'Unknown',
        balance: {
          available: account.balances.available || 0,
          current: account.balances.current || 0,
          limit: account.balances.limit || null,
        },
        institution: {
          id: account.account_id.split('_')[0],
          name: 'Unknown',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getTransactions(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await this.client.transactionsGet({
        access_token: await this.getAccessToken(userId),
        start_date: startDate,
        end_date: endDate,
      });

      return response.data.transactions.map(transaction => ({
        userId,
        plaidTransactionId: transaction.transaction_id,
        id: transaction.transaction_id,
        accountId: transaction.account_id,
        amount: transaction.amount,
        date: new Date(transaction.date),
        name: transaction.name,
        merchantName: transaction.merchant_name,
        category: transaction.category || [],
        pending: transaction.pending,
        type: transaction.transaction_type,
        isoCurrencyCode: transaction.iso_currency_code || 'USD',
        location: transaction.location ? {
          address: transaction.location.address,
          city: transaction.location.city,
          region: transaction.location.region,
          postalCode: transaction.location.postal_code,
          country: transaction.location.country,
          lat: transaction.location.lat,
          lon: transaction.location.lon,
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async refreshAccountBalances(userId: string): Promise<void> {
    try {
      await api.post(`/api/plaid/refresh/${userId}`);
    } catch (error) {
      console.error('Error refreshing account balances:', error);
      throw error;
    }
  }

  async syncTransactions(userId: string): Promise<void> {
    try {
      await api.post(`/api/plaid/sync/${userId}`);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  async handleWebhook(data: any): Promise<void> {
    try {
      await api.post('/api/plaid/webhook', data);
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async getBills(userId: string): Promise<PlaidBill[]> {
    try {
      const plaidAccounts = await prisma.plaidAccount.findMany({
        where: { userId },
        select: { accessToken: true },
      });

      if (!plaidAccounts.length) {
        return [];
      }

      const allBills: PlaidBill[][] = await Promise.all(
        plaidAccounts.map(async ({ accessToken }: { accessToken: string }) => {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 3);

          const response = await this.client.transactionsGet({
            access_token: accessToken,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            options: {
              include_personal_finance_category: true,
            },
          });

          const transactionsByMerchant = response.data.transactions.reduce((acc, transaction) => {
            const key = transaction.merchant_name || transaction.name;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(transaction);
            return acc;
          }, {} as Record<string, PlaidTransaction[]>);

          return Object.entries(transactionsByMerchant)
            .filter(([_, transactions]) => transactions.length >= 2)
            .map(([merchantName, transactions]) => {
              const sortedTransactions = transactions.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const lastTransaction = sortedTransactions[0];

              return {
                bill_id: `${lastTransaction.account_id}-${merchantName}`,
                account_id: lastTransaction.account_id,
                name: merchantName,
                amount: Math.abs(lastTransaction.amount),
                due_date: lastTransaction.date,
                category: lastTransaction.personal_finance_category?.primary || 'Other',
                status: this.determineBillStatus(lastTransaction.date),
                last_payment_date: lastTransaction.date,
                next_payment_date: this.predictNextPaymentDate(
                  lastTransaction.date,
                  this.determineFrequency(sortedTransactions)
                ),
              };
            });
        })
      );

      return Array.from(
        new Map(
          allBills.flat().map((bill: PlaidBill) => [bill.bill_id, bill])
        ).values()
      );
    } catch (error) {
      console.error('Error fetching Plaid bills:', error);
      throw error;
    }
  }

  private determineBillStatus(lastPaymentDate: string): 'paid' | 'pending' | 'overdue' {
    const lastPayment = new Date(lastPaymentDate);
    const today = new Date();
    const daysSinceLastPayment = Math.floor(
      (today.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPayment <= 30) {
      return 'paid';
    } else if (daysSinceLastPayment <= 35) {
      return 'pending';
    } else {
      return 'overdue';
    }
  }

  private predictNextPaymentDate(lastDate: string, frequency: string): string {
    const lastPayment = new Date(lastDate);
    const nextPayment = new Date(lastPayment);

    switch (frequency) {
      case 'WEEKLY':
        nextPayment.setDate(lastPayment.getDate() + 7);
        break;
      case 'BIWEEKLY':
        nextPayment.setDate(lastPayment.getDate() + 14);
        break;
      case 'MONTHLY':
        nextPayment.setMonth(lastPayment.getMonth() + 1);
        break;
      case 'YEARLY':
        nextPayment.setFullYear(lastPayment.getFullYear() + 1);
        break;
      default:
        nextPayment.setMonth(lastPayment.getMonth() + 1);
    }

    return nextPayment.toISOString().split('T')[0];
  }

  private determineFrequency(transactions: PlaidTransaction[]): string {
    if (transactions.length < 2) return 'MONTHLY';

    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const days = Math.round(
        (new Date(transactions[i - 1].date).getTime() - new Date(transactions[i].date).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (averageInterval <= 9) return 'WEEKLY';
    if (averageInterval <= 16) return 'BIWEEKLY';
    if (averageInterval <= 45) return 'MONTHLY';
    return 'YEARLY';
  }

  private async getAccessToken(userId: string): Promise<string> {
    const plaidItem = await prisma.plaidItem.findFirst({
      where: { userId },
      select: { accessToken: true },
    });

    if (!plaidItem?.accessToken) {
      throw new Error('No Plaid access token found for user');
    }

    return plaidItem.accessToken;
  }
}
