import React from 'react';

// Define the RecurringTransaction interface
export interface RecurringTransaction {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    nextDate: string;
}

// Define the props interface
export interface RecurringTransactionsListProps {
    income: RecurringTransaction[];
    expenses: RecurringTransaction[];
    isLoading: boolean;
}

// Export the component
export const RecurringTransactionsList: React.FC<RecurringTransactionsListProps> = ({
    income,
    expenses,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Income</h3>
                <div className="space-y-4">
                    {income.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                            <div>
                                <p className="font-medium">{transaction.name}</p>
                                <p className="text-sm text-gray-500">
                                    Next: {new Date(transaction.nextDate).toLocaleDateString()} • {transaction.frequency}
                                </p>
                            </div>
                            <div className="text-lg font-semibold text-green-600">
                                +${transaction.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}

                    {income.length === 0 && (
                        <p className="text-center text-gray-500">No recurring income found.</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Expenses</h3>
                <div className="space-y-4">
                    {expenses.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                            <div>
                                <p className="font-medium">{transaction.name}</p>
                                <p className="text-sm text-gray-500">
                                    Next: {new Date(transaction.nextDate).toLocaleDateString()} • {transaction.frequency}
                                </p>
                            </div>
                            <div className="text-lg font-semibold text-red-600">
                                -${transaction.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}

                    {expenses.length === 0 && (
                        <p className="text-center text-gray-500">No recurring expenses found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Default export to ensure it's treated as a module
export default RecurringTransactionsList; 