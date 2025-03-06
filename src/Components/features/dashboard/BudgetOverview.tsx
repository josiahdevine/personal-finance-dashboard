import React from 'react';
import { Card } from '../../common/Card';
import { useBudgets } from '../../../hooks/useBudgets';
import { formatCurrency } from '../../../utils/formatters';

export const BudgetOverview: React.FC = () => {
  const { budgets, loading } = useBudgets();

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'bg-red-600';
    if (percentUsed >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Budget Overview</h2>
          <a href="/budgets" className="text-blue-600 hover:text-blue-700 text-sm">
            Manage Budgets
          </a>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentUsed = (budget.spent / budget.amount) * 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(percentUsed)} transition-all`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(Math.max(budget.amount - budget.spent, 0))} remaining
                  </p>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <p className="text-center text-gray-500">
                No budgets set up yet
              </p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 