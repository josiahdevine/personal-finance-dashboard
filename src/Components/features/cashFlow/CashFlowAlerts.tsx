import React from 'react';
import { Card } from '../../common/Card';
import { format as formatDate } from 'date-fns';

interface Alert {
    date?: string;
    type: 'warning' | 'info' | 'danger';
    message: string;
}

interface CashFlowAlertsProps {
    alerts: Alert[];
    isLoading: boolean;
}

export const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({
    alerts,
    isLoading
}) => {
    // Get alert icon and color based on type
    const getAlertStyles = (
        type: 'warning' | 'info' | 'danger'
    ) => {
        const typeColors = {
            warning: 'text-orange-500 bg-orange-100',
            info: 'text-blue-500 bg-blue-100',
            danger: 'text-red-500 bg-red-100'
        };

        const typeIcons = {
            warning: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            info: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            danger: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };

        return {
            colorClass: typeColors[type],
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
                            const { colorClass, icon } = getAlertStyles(alert.type);

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
                                                    {alert.type === 'warning' ? 'Warning Alert' :
                                                     alert.type === 'info' ? 'Info Alert' : 'Danger Alert'}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {alert.date ? formatDate(new Date(alert.date), 'MMMM d, yyyy') : 'No date'}
                                                </div>
                                            </div>
                                        </div>
                                        <p>{alert.message}</p>
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