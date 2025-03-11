import React, { useState } from 'react';
import Card from "../../common/Card";
import { Select } from '../../common/Select';

interface CashFlowPrediction {
  date: string;
  cashFlow: number;
  confidenceLow: number;
  confidenceHigh: number;
  recurringTransactions: Array<{
    merchantName: string;
    amount: number;
    category: string;
    isIncome: boolean;
  }>;
}

interface RecurringTransaction {
  merchantName: string;
  amount: number;
  category: string;
  isIncome: boolean;
}

interface ScenarioAnalysisProps {
  basePredictions: CashFlowPrediction[];
  recurringTransactions: RecurringTransaction[];
}

export const ScenarioAnalysis: React.FC<ScenarioAnalysisProps> = ({
  basePredictions,
  recurringTransactions
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'remove' | 'modify'>('remove');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);

  const calculateScenarioImpact = () => {
    if (!selectedTransaction) return null;

    const transaction = recurringTransactions.find(tx => tx.merchantName === selectedTransaction);
    if (!transaction) return null;

    const originalTotal = basePredictions.reduce((sum, day) => sum + day.cashFlow, 0);
    let adjustedTotal = originalTotal;

    if (adjustmentType === 'remove') {
      // Remove all occurrences of the transaction
      adjustedTotal = basePredictions.reduce((sum, day) => {
        const dayWithoutTx = day.cashFlow - (
          day.recurringTransactions
            .find(tx => tx.merchantName === selectedTransaction)?.amount || 0
        );
        return sum + dayWithoutTx;
      }, 0);
    } else {
      // Modify the transaction amount
      const amountDiff = adjustmentAmount - transaction.amount;
      const occurrences = basePredictions.filter(day =>
        day.recurringTransactions.some(tx => tx.merchantName === selectedTransaction)
      ).length;
      adjustedTotal = originalTotal + (amountDiff * occurrences);
    }

    return {
      originalTotal,
      adjustedTotal,
      difference: adjustedTotal - originalTotal,
      percentageChange: ((adjustedTotal - originalTotal) / Math.abs(originalTotal)) * 100
    };
  };

  const impact = calculateScenarioImpact();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Transaction
          </label>
          <Select
            value={selectedTransaction}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTransaction(e.target.value)}
            options={[
              { value: '', label: 'Select a transaction...' },
              ...recurringTransactions.map(tx => ({
                value: tx.merchantName,
                label: `${tx.merchantName} (${tx.isIncome ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)})`
              }))
            ]}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjustment Type
          </label>
          <Select
            value={adjustmentType}
            onChange={e => setAdjustmentType(e.target.value as 'remove' | 'modify')}
            options={[
              { value: 'remove', label: 'Remove Transaction' },
              { value: 'modify', label: 'Modify Amount' }
            ]}
            className="w-full"
          />
        </div>

        {adjustmentType === 'modify' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Amount
            </label>
            <input
              type="number"
              value={adjustmentAmount}
              onChange={e => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {impact && (
        <Card>
          <Card.Body>
            <h3 className="text-lg font-semibold mb-4">Scenario Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Original Total</p>
                <p className="text-lg font-semibold">
                  ${Math.abs(impact.originalTotal).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adjusted Total</p>
                <p className="text-lg font-semibold">
                  ${Math.abs(impact.adjustedTotal).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difference</p>
                <p className={`text-lg font-semibold ${impact.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {impact.difference >= 0 ? '+' : '-'}${Math.abs(impact.difference).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Percentage Change</p>
                <p className={`text-lg font-semibold ${impact.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {impact.percentageChange >= 0 ? '+' : ''}{impact.percentageChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}; 