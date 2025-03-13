// Simple plaidService implementation
const plaidServiceInstance = {
  createLinkToken: async () => 'dummy-token',
  exchangePublicToken: async () => ({ success: true }),
  getAccounts: async () => [],
  getTransactions: async () => [],
  syncTransactions: async () => ({ added: 0, modified: 0, removed: 0 }),
  getBalanceHistory: async () => [],
  getInvestmentHoldings: async () => [],
  getInvestmentTransactions: async () => []
};

// Export as both default and named export for compatibility
export { plaidServiceInstance as plaidService };
export default plaidServiceInstance; 