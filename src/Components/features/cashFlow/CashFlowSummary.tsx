import React from 'react';
import { Card } from '../../common/Card';

interface CashFlowSummaryProps {
    prediction?: {
        cashFlow: number;
        confidenceLow: number;
        confidenceHigh: number;
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
                            <div className={`text-2xl font-bold ${prediction.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {prediction.cashFlow >= 0 ? '+' : '-'}{formatCurrency(prediction.cashFlow)}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600">Confidence Range</div>
                            <div className="text-base">
                                {formatCurrency(prediction.confidenceLow)} - {formatCurrency(prediction.confidenceHigh)}
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            {prediction.cashFlow >= 0 ? (
                                <p>
                                    You are projected to have a positive cash flow. Consider investing or saving the surplus.
                                </p>
                            ) : (
                                <p>
                                    You are projected to have a negative cash flow. Consider reviewing your expenses or finding additional income sources.
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