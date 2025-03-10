import React, { useState, useEffect } from 'react';
import { PortfolioDashboard } from '../components/features/investment/PortfolioDashboard';

interface Account {
    id: string;
    name: string;
    type: string;
    institution: string;
    balance: number;
}

export const InvestmentPortfolioPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/investment-accounts');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch investment accounts');
                }

                setAccounts(data.accounts);
                // By default, select all accounts
                setSelectedAccountIds(data.accounts.map((account: Account) => account.id));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching accounts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const handleAccountToggle = (accountId: string) => {
        setSelectedAccountIds(prev => {
            if (prev.includes(accountId)) {
                return prev.filter(id => id !== accountId);
            }
            return [...prev, accountId];
        });
    };

    const handleSelectAll = () => {
        setSelectedAccountIds(accounts.map(account => account.id));
    };

    const handleClearAll = () => {
        setSelectedAccountIds([]);
    };

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p className="text-lg font-medium">Error</p>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Account Selection */}
            <div className="mb-8 bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Investment Accounts
                        </h2>
                        <div className="space-x-2">
                            <button
                                onClick={handleSelectAll}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map(account => (
                                <div
                                    key={account.id}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                        selectedAccountIds.includes(account.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => handleAccountToggle(account.id)}
                                >
                                    <div className="font-medium text-gray-900">{account.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {account.institution} • {account.type}
                                    </div>
                                    <div className="mt-2 text-lg font-semibold text-gray-900">
                                        ${account.balance.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Portfolio Dashboard */}
            {selectedAccountIds.length > 0 ? (
                <PortfolioDashboard accountIds={selectedAccountIds} />
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-lg text-gray-500">
                        Select one or more accounts to view portfolio analysis
                    </p>
                </div>
            )}
        </div>
    );
};

 
