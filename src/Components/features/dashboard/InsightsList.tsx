import React from 'react';
import { Card } from '../../common/Card';
import { useInsights } from '../../../hooks/useInsights';

export const InsightsList: React.FC = () => {
  const { insights, dismissInsight } = useInsights();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Financial Insights</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{insight.title}</h3>
                  <p className="mt-1 text-sm">{insight.description}</p>
                </div>
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="text-sm opacity-75 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-center text-gray-500">
              No new insights available
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 