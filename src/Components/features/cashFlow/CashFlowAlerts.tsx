import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { format as formatDate } from 'date-fns';

interface Alert {
    date: string;
    type: 'negative-balance' | 'large-expense' | 'unusual-activity';
    message: string;
    severity: 'low' | 'medium' | 'high';
    relatedTransactions?: Array<{
        merchantName: string;
        amount: number;
        isIncome: boolean;
    }>;
}

interface CashFlowAlertsProps {
    alerts: Alert[];
    isLoading: boolean;
}

export const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({
    alerts,
    isLoading
}) => {
    // Get alert icon and color based on type and severity
    const getAlertStyles = (
        type: 'negative-balance' | 'large-expense' | 'unusual-activity',
        severity: 'low' | 'medium' | 'high'
    ) => {
        const severityColors = {
            low: 'text-blue-500 bg-blue-100',
            medium: 'text-orange-500 bg-orange-100',
            high: 'text-red-500 bg-red-100'
        };

        const typeIcons = {
            'negative-balance': (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            ),
            'large-expense': (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'unusual-activity': (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        };

        return {
            colorClass: severityColors[severity],
            icon: typeIcons[type]
        };
    };

    return (
        <Card className="w-full">
            <Card.Header>
                <h3 className="text-lg font-semibold">Cash Flow Alerts</h3>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : alerts.length > 0 ? (
                    <div className="space-y-4">
                        {alerts.map((alert, index) => {
                            const { colorClass, icon } = getAlertStyles(alert.type, alert.severity);

                            return (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 flex items-start"
                                >
                                    <div className={`rounded-full p-2 ${colorClass} mr-4 flex-shrink-0`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">
                                                    {alert.type === 'negative-balance' ? 'Negative Balance Alert' :
                                                     alert.type === 'large-expense' ? 'Large Expense Alert' :
                                                     'Unusual Activity Alert'}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {formatDate(new Date(alert.date), 'MMMM d, yyyy')}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    alert.severity === 'high' ? 'error' :
                                                    alert.severity === 'medium' ? 'warning' : 'info'
                                                }
                                            >
                                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                            </Badge>
                                        </div>
                                        <p>{alert.message}</p>

                                        {alert.relatedTransactions && alert.relatedTransactions.length > 0 && (
                                            <div className="mt-2">
                                                <div className="text-sm font-medium mb-1">Related Transactions:</div>
                                                <div className="space-y-1">
                                                    {alert.relatedTransactions.map((tx, idx) => (
                                                        <div key={idx} className="text-sm flex justify-between">
                                                            <span>{tx.merchantName}</span>
                                                            <span className="font-medium">
                                                                {tx.isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-24 text-gray-500">
                        No alerts found
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}; 