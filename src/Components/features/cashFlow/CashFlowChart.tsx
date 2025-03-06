import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Card } from '../../common/Card';
import { Select } from '../../common/Select';
import { Toggle } from '../../common/Toggle';
import { format as formatDate } from 'date-fns';

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

interface CashFlowChartProps {
    predictions: CashFlowPrediction[];
    timeframe: 'daily' | 'weekly' | 'monthly';
    onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
    isLoading: boolean;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            displayDate: string;
            cashFlow: number;
            confidenceLow: number;
            confidenceHigh: number;
        };
    }>;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
    predictions,
    timeframe,
    onTimeframeChange,
    isLoading
}) => {
    const [showConfidenceInterval, setShowConfidenceInterval] = React.useState(true);
    const [chartData, setChartData] = React.useState<any[]>([]);

    // Process data based on selected timeframe
    React.useEffect(() => {
        if (!predictions) return;

        let data;
        switch (timeframe) {
            case 'daily':
                data = predictions.dailyPredictions?.map((day: any) => ({
                    date: day.date,
                    cashFlow: day.cashFlow,
                    confidenceLow: day.confidenceLow,
                    confidenceHigh: day.confidenceHigh,
                    displayDate: formatDate(new Date(day.date), 'MMM d, yyyy')
                }));
                break;

            case 'weekly':
                data = predictions.weeklyPredictions?.map((week: any) => ({
                    date: week.startDate,
                    cashFlow: week.cashFlow,
                    confidenceLow: week.confidenceLow,
                    confidenceHigh: week.confidenceHigh,
                    displayDate: `${formatDate(new Date(week.startDate), 'MMM d')} - ${formatDate(new Date(week.endDate), 'MMM d, yyyy')}`
                }));
                break;

            case 'monthly':
                data = predictions.monthlyPredictions?.map((month: any) => ({
                    date: month.month,
                    cashFlow: month.cashFlow,
                    confidenceLow: month.confidenceLow,
                    confidenceHigh: month.confidenceHigh,
                    displayDate: month.month
                }));
                break;

            default:
                data = [];
        }

        setChartData(data || []);
    }, [predictions, timeframe]);

    // Format currency for display
    const formatValue = (value: number) => {
        return `$${Math.abs(value).toFixed(2)}`;
    };

    const formatXAxis = (date: string) => {
        switch (timeframe) {
            case 'daily':
                return formatDate(new Date(date), 'MMM d');
            case 'weekly':
                return formatDate(new Date(date), 'MMM d');
            case 'monthly':
                return formatDate(new Date(date), 'MMM yyyy');
        }
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const recurringTransactions = data.recurringTransactions || [];
        const hasRecurring = recurringTransactions.length > 0;

        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-medium mb-2">
                    {formatDate(new Date(label), 'MMMM d, yyyy')}
                </p>
                <p className={`text-lg font-semibold ${data.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.cashFlow >= 0 ? '+' : '-'}{formatValue(data.cashFlow)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Confidence Range: {formatCurrency(data.confidenceLow)} to {formatCurrency(data.confidenceHigh)}
                </p>
                {hasRecurring && (
                    <div className="mt-2 border-t pt-2">
                        <p className="text-sm font-medium mb-1">Recurring Transactions:</p>
                        <div className="space-y-1">
                            {recurringTransactions.map((tx: any, index: number) => (
                                <div key={index} className="text-sm flex justify-between">
                                    <span>{tx.merchantName}</span>
                                    <span className={tx.isIncome ? 'text-green-600' : 'text-red-600'}>
                                        {tx.isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="w-full h-96">
            <Card.Header>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Cash Flow Projection</h3>
                    <div className="flex space-x-4 items-center">
                        <Select
                            value={timeframe}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTimeframeChange(e.target.value as any)}
                            options={[
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' }
                            ]}
                            className="w-32"
                        />
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Confidence Interval</span>
                            <Toggle
                                checked={showConfidenceInterval}
                                onChange={setShowConfidenceInterval}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {showConfidenceInterval ? (
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatXAxis}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (Math.abs(value) / 1000).toFixed(1) + 'k' : Math.abs(value)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="confidenceLow"
                                    stroke="none"
                                    fillOpacity={1}
                                    fill="url(#colorConfidence)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="confidenceHigh"
                                    stroke="none"
                                    fillOpacity={1}
                                    fill="url(#colorConfidence)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cashFlow"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatXAxis}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (Math.abs(value) / 1000).toFixed(1) + 'k' : Math.abs(value)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cashFlow"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No prediction data available
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}; 