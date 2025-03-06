import React from 'react';

interface RecurringTransaction {
    merchantName: string;
    amount: number;
    category: string;
    isIncome: boolean;
}

interface RecurringTransactionsListProps {
    transactions: RecurringTransaction[];
}

export const RecurringTransactionsList: React.FC<RecurringTransactionsListProps> = ({
    transactions
}) => {
    return (
        <div className="space-y-4">
            {transactions.map((transaction, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                    <div>
                        <p className="font-medium">{transaction.merchantName}</p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                    <div className={`text-lg font-semibold ${transaction.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                </div>
            ))}

            {transactions.length === 0 && (
                <p className="text-center text-gray-500">No recurring transactions found.</p>
            )}
        </div>
    );
}; 