import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { CashFlowChart } from '../components/features/cashFlow/CashFlowChart';
import { CashFlowAlerts } from '../components/features/cashFlow/CashFlowAlerts';
import { RecurringTransactionsList } from '../components/features/cashFlow/RecurringTransactionsList';
import { CashFlowSummary } from '../components/features/cashFlow/CashFlowSummary';
import { Card } from '../components/common/Card';
import { Select } from '../components/common/Select';
import { Toggle } from '../components/common/Toggle';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

const CashFlowPredictionPage: React.FC = () => {
    // State
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [predictionConfig, setPredictionConfig] = useState({
        timeframeInDays: 90,
        modelType: 'hybrid' as const,
        includePendingTransactions: true,
        includeRecurringTransactions: true,
        confidenceLevel: 0.95
    });

    // Fetch predictions
    const { data: predictions, isLoading, error, refetch } = useQuery(
        ['cashFlowPredictions', predictionConfig],
        () => api.get('/api/cash-flow/predictions', { params: predictionConfig }),
        {
            refetchOnWindowFocus: false
        }
    );

    // Handle config changes
    const handleConfigChange = (key: keyof typeof predictionConfig, value: any) => {
        setPredictionConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Cash Flow Prediction</h1>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p className="font-bold">Error</p>
                    <p>{(error as Error).message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <Card.Header>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Prediction Settings</h3>
                            <Button
                                variant="primary"
                                onClick={() => refetch()}
                                loading={isLoading}
                            >
                                Refresh Predictions
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prediction Timeframe
                                </label>
                                <Select
                                    value={predictionConfig.timeframeInDays.toString()}
                                    onChange={e => handleConfigChange('timeframeInDays', parseInt(e.target.value))}
                                    options={[
                                        { value: '30', label: '30 Days' },
                                        { value: '90', label: '90 Days' },
                                        { value: '180', label: '6 Months' },
                                        { value: '365', label: '1 Year' }
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prediction Model
                                </label>
                                <Select
                                    value={predictionConfig.modelType}
                                    onChange={e => handleConfigChange('modelType', e.target.value)}
                                    options={[
                                        { value: 'hybrid', label: 'Hybrid Model' },
                                        { value: 'time-series', label: 'Time Series' },
                                        { value: 'recurring-transaction', label: 'Recurring Transactions' }
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confidence Level
                                </label>
                                <Select
                                    value={predictionConfig.confidenceLevel.toString()}
                                    onChange={e => handleConfigChange('confidenceLevel', parseFloat(e.target.value))}
                                    options={[
                                        { value: '0.8', label: '80%' },
                                        { value: '0.9', label: '90%' },
                                        { value: '0.95', label: '95%' },
                                        { value: '0.99', label: '99%' }
                                    ]}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex space-x-8">
                            <div className="flex items-center">
                                <Toggle
                                    checked={predictionConfig.includePendingTransactions}
                                    onChange={value => handleConfigChange('includePendingTransactions', value)}
                                    label="Include Pending Transactions"
                                />
                            </div>

                            <div className="flex items-center">
                                <Toggle
                                    checked={predictionConfig.includeRecurringTransactions}
                                    onChange={value => handleConfigChange('includeRecurringTransactions', value)}
                                    label="Include Recurring Transactions"
                                />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <CashFlowSummary
                    prediction={predictions?.totalPrediction}
                    isLoading={isLoading}
                />
            </div>

            <div className="mb-6">
                <CashFlowChart
                    predictions={predictions}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashFlowAlerts
                    alerts={predictions?.alerts || []}
                    isLoading={isLoading}
                />

                <RecurringTransactionsList
                    income={predictions?.recurringTransactions?.income || []}
                    expenses={predictions?.recurringTransactions?.expenses || []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default CashFlowPredictionPage; 