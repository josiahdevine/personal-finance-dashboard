import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { investmentAccountRepository } from '../repositories/InvestmentAccountRepository';
import { securitiesRepository } from '../repositories/SecuritiesRepository';
import { investmentHoldingsRepository } from '../repositories/InvestmentHoldingsRepository';
import { investmentTransactionsRepository } from '../repositories/InvestmentTransactionsRepository';
import { InvestmentAccount, Security, InvestmentHolding, InvestmentTransaction } from '../types/Investment';

class PlaidInvestmentService {
    private plaidClient: PlaidApi;

    constructor() {
        const configuration = new Configuration({
            basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                    'PLAID-SECRET': process.env.PLAID_SECRET,
                },
            },
        });

        this.plaidClient = new PlaidApi(configuration);
    }

    /**
     * Create a link token for investment accounts
     */
    async createLinkToken(userId: string): Promise<string> {
        try {
            const response = await this.plaidClient.linkTokenCreate({
                user: {
                    client_user_id: userId,
                },
                client_name: 'Finance Dashboard',
                products: ['investments' as Products],
                country_codes: ['US' as CountryCode],
                language: 'en',
            });

            return response.data.link_token;
        } catch (error) {
            console.error('Error creating Plaid investment link token:', error);
            throw error;
        }
    }

    /**
     * Exchange public token for access token
     */
    async exchangePublicToken(publicToken: string): Promise<string> {
        try {
            const response = await this.plaidClient.itemPublicTokenExchange({
                public_token: publicToken,
            });

            return response.data.access_token;
        } catch (error) {
            console.error('Error exchanging public token:', error);
            throw error;
        }
    }

    /**
     * Sync investment accounts for a user
     */
    async syncInvestmentAccounts(userId: string, accessToken: string): Promise<void> {
        try {
            // Get accounts from Plaid
            const accountsResponse = await this.plaidClient.investmentsHoldingsGet({
                access_token: accessToken,
            });

            const { accounts, holdings, securities } = accountsResponse.data;

            // Get institution details
            const itemResponse = await this.plaidClient.itemGet({
                access_token: accessToken,
            });

            const institutionId = itemResponse.data.item.institution_id;
            if (!institutionId) {
                throw new Error('Institution ID not found');
            }

            const institutionResponse = await this.plaidClient.institutionsGetById({
                institution_id: institutionId,
                country_codes: ['US' as CountryCode],
            });

            const institution = institutionResponse.data.institution;

            // Process accounts
            for (const account of accounts) {
                if (account.type === 'investment') {
                    // Create or update investment account
                    const investmentAccount: Partial<InvestmentAccount> = {
                        user_id: userId,
                        plaid_item_id: itemResponse.data.item.item_id || undefined,
                        plaid_account_id: account.account_id,
                        name: account.name || 'Unnamed Account',
                        type: account.type as any,
                        subtype: account.subtype || '',
                        institution_name: institution.name,
                        institution_logo_url: institution.logo || undefined,
                        balance: account.balances.current || 0,
                        available_balance: account.balances.available || undefined,
                        currency_code: account.balances.iso_currency_code || 'USD',
                        is_manual: false,
                    };

                    await investmentAccountRepository.create(investmentAccount);
                }
            }

            // Process securities
            for (const security of securities) {
                const securityData: Partial<Security> = {
                    ticker_symbol: security.ticker_symbol || undefined,
                    name: security.name || '',
                    type: security.type || 'other',
                    close_price: security.close_price || undefined,
                    close_price_as_of: security.close_price_as_of || undefined,
                    isin: security.isin || undefined,
                    cusip: security.cusip || undefined,
                    currency_code: security.iso_currency_code || 'USD',
                    is_cash_equivalent: security.is_cash_equivalent || false,
                };

                await securitiesRepository.create(securityData);
            }

            // Process holdings
            for (const holding of holdings) {
                const account = accounts.find(a => a.account_id === holding.account_id);
                const security = securities.find(s => s.security_id === holding.security_id);

                if (account && security) {
                    const holdingData: Partial<InvestmentHolding> = {
                        investment_account_id: account.account_id,
                        security_id: security.security_id,
                        cost_basis: holding.cost_basis || undefined,
                        quantity: holding.quantity,
                        value: holding.institution_value || 0,
                        institution_value: holding.institution_value || undefined,
                        institution_price: holding.institution_price || undefined,
                        institution_price_as_of: holding.institution_price_as_of || undefined,
                        is_manual: false,
                    };

                    await investmentHoldingsRepository.upsert(holdingData);
                }
            }

            // Get and process transactions
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Last 30 days

            const transactionsResponse = await this.plaidClient.investmentsTransactionsGet({
                access_token: accessToken,
                start_date: startDate.toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
            });

            const transactions = transactionsResponse.data.investment_transactions;

            // Process transactions in batches
            const transactionBatch: Partial<InvestmentTransaction>[] = [];

            for (const transaction of transactions) {
                const account = accounts.find(a => a.account_id === transaction.account_id);
                const security = securities.find(s => s.security_id === transaction.security_id);

                if (account) {
                    const transactionData: Partial<InvestmentTransaction> = {
                        investment_account_id: account.account_id,
                        security_id: security?.security_id,
                        transaction_type: transaction.type,
                        amount: transaction.amount,
                        quantity: transaction.quantity || undefined,
                        price: transaction.price || undefined,
                        fees: transaction.fees || undefined,
                        date: transaction.date,
                        name: transaction.name || undefined,
                    };

                    transactionBatch.push(transactionData);
                }
            }

            if (transactionBatch.length > 0) {
                await investmentTransactionsRepository.createBatch(transactionBatch);
            }
        } catch (error) {
            console.error('Error syncing investment accounts:', error);
            throw error;
        }
    }

    /**
     * Get investment holdings for a user
     */
    async getInvestmentHoldings(userId: string): Promise<{
        accounts: InvestmentAccount[];
        holdings: Array<InvestmentHolding & { security: Security }>;
    }> {
        try {
            const accounts = await investmentAccountRepository.findByUserId(userId);
            const holdings: Array<InvestmentHolding & { security: Security }> = [];

            for (const account of accounts) {
                const accountHoldings = await investmentHoldingsRepository.getByAccountId(account.id);
                holdings.push(...accountHoldings);
            }

            return {
                accounts,
                holdings,
            };
        } catch (error) {
            console.error('Error getting investment holdings:', error);
            throw error;
        }
    }

    /**
     * Get investment transactions for a user
     */
    async getInvestmentTransactions(
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<{
        accounts: InvestmentAccount[];
        transactions: Array<InvestmentTransaction & { security?: Security }>;
    }> {
        try {
            const accounts = await investmentAccountRepository.findByUserId(userId);
            const transactions: Array<InvestmentTransaction & { security?: Security }> = [];

            for (const account of accounts) {
                const accountTransactions = await investmentTransactionsRepository.getByAccountId(
                    account.id,
                    startDate,
                    endDate
                );
                transactions.push(...accountTransactions);
            }

            return {
                accounts,
                transactions,
            };
        } catch (error) {
            console.error('Error getting investment transactions:', error);
            throw error;
        }
    }
}

export const plaidInvestmentService = new PlaidInvestmentService(); 