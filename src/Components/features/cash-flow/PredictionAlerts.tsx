import React from 'react';

interface Alert {
  date: string;
  type: 'negative-balance' | 'large-expense' | 'unusual-activity';
  message: string;
  severity: 'low' | 'medium' | 'high';
  relatedTransactions?: Array<{
    merchantName: string;
    amount: number;
    category: string;
  }>;
}

interface PredictionAlertsProps {
  alerts: Alert[];
}

export const PredictionAlerts: React.FC<PredictionAlertsProps> = ({ alerts }) => {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'negative-balance':
        return '⚠️';
      case 'large-expense':
        return '💰';
      case 'unusual-activity':
        return '❗';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start">
            <span className="text-xl mr-3" role="img" aria-label={alert.type}>
              {getTypeIcon(alert.type)}
            </span>
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm mt-1">
                {new Date(alert.date).toLocaleDateString()}
              </p>
              {alert.relatedTransactions && alert.relatedTransactions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Related Transactions:</p>
                  <ul className="text-sm space-y-1">
                    {alert.relatedTransactions.map((tx, txIndex) => (
                      <li key={txIndex} className="flex justify-between">
                        <span>{tx.merchantName}</span>
                        <span>${Math.abs(tx.amount).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 