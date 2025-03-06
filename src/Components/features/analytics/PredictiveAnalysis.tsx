import React from 'react';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../utils/formatters';

export const PredictiveAnalysis: React.FC = () => {
  const { predictions, loading } = useAnalytics();

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Financial Projections</h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Expected Monthly Savings</h3>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(predictions?.expectedSavings || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Based on your current income and spending patterns
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Projected Net Worth</h3>
              <div className="mt-2 space-y-2">
                {predictions?.netWorthProjections?.map(projection => (
                  <div key={projection.date} className="flex justify-between">
                    <span>{projection.date}</span>
                    <span className="font-medium">
                      {formatCurrency(projection.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Goal Achievement</h3>
              <div className="mt-2 space-y-4">
                {predictions?.goalProjections?.map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between">
                      <span>{goal.name}</span>
                      <span className="text-gray-600">
                        {goal.expectedCompletion}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${goal.probabilityOfSuccess}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 