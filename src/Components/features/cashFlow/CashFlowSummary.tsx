import React from 'react';
import { Card } from '../../common/Card';

interface CashFlowSummaryProps {
    prediction?: {
        balance: number;
        trend: 'up' | 'down' | 'stable';
        percentageChange: number;
    };
    isLoading: boolean;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({
    prediction,
    isLoading
}) => {
    // Format currency for display
    const formatCurrency = (value: number) => {
        return `$${Math.abs(value).toFixed(2)}`;
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="text-lg font-semibold">Total Prediction</h3>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : prediction ? (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-600">Net Cash Flow</div>
                            <div className={`text-2xl font-bold ${prediction.trend === 'up' ? 'text-green-600' : prediction.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                {prediction.trend === 'up' ? '+' : prediction.trend === 'down' ? '-' : ''}{formatCurrency(prediction.balance)}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600">Percentage Change</div>
                            <div className="text-base">
                                {prediction.percentageChange >= 0 ? '+' : ''}{(prediction.percentageChange * 100).toFixed(2)}%
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            {prediction.trend === 'up' ? (
                                <p>
                                    You are projected to have a positive cash flow. Consider investing or saving the surplus.
                                </p>
                            ) : prediction.trend === 'down' ? (
                                <p>
                                    You are projected to have a negative cash flow. Consider reviewing your expenses or finding additional income sources.
                                </p>
                            ) : (
                                <p>
                                    You are projected to have a stable cash flow.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-4">
                        No prediction data available
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}; 