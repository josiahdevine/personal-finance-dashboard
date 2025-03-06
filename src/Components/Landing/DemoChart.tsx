import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  savings: number;
  investments: number;
  expenses: number;
  date: Date;
  netWorth?: number;
  debtToIncome?: number;
  savingsRate?: number;
}

type DateRange = 'week' | 'month' | '3months' | '6months' | 'year';

const calculateFinancialMetrics = (data: ChartData): Partial<ChartData> => {
  const netWorth = data.savings + data.investments - data.expenses;
  const debtToIncome = data.expenses / (data.savings + data.investments);
  const savingsRate = (data.savings / (data.savings + data.investments + data.expenses)) * 100;

  return {
    ...data,
    netWorth,
    debtToIncome: Number(debtToIncome.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(2))
  };
};

const generateDataForRange = (range: DateRange): ChartData[] => {
  const data: ChartData[] = [];
  const now = new Date();
  const intervals = {
    week: 7,
    month: 30,
    '3months': 90,
    '6months': 180,
    year: 365,
  };

  const days = intervals[range];
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseData = {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date,
      savings: Math.floor(Math.random() * 5000) + 3000,
      investments: Math.floor(Math.random() * 8000) + 5000,
      expenses: Math.floor(Math.random() * 3000) + 1000,
    };
    data.push({
      ...baseData,
      ...calculateFinancialMetrics(baseData)
    });
  }
  return data;
};

export const DemoChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('month');
  const [data, setData] = useState<ChartData[]>(generateDataForRange('month'));
  const [selectedDataKey, setSelectedDataKey] = useState<'savings' | 'investments' | 'expenses' | 'netWorth' | 'debtToIncome' | 'savingsRate'>('savings');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<ChartData[]>([]);

  useEffect(() => {
    const newData = generateDataForRange(selectedRange);
    setData(newData);
    if (showComparison) {
      const previousPeriodData = generateDataForRange(selectedRange).map(item => ({
        ...item,
        date: new Date(item.date.getTime() - intervals[selectedRange] * 24 * 60 * 60 * 1000),
      }));
      setComparisonData(previousPeriodData);
    }
  }, [selectedRange, showComparison]);

  // Restore real-time updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setData(currentData => {
        return currentData.map(item => {
          if (Math.random() > 0.5) {
            const updatedData = { ...item };
            const change = Math.floor(Math.random() * 500) - 250;
            updatedData[selectedDataKey] = Math.max(0, (updatedData[selectedDataKey] || 0) + change);
            return calculateFinancialMetrics(updatedData) as ChartData;
          }
          return item;
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedDataKey]);

  const handleExport = () => {
    const exportData = data.map(item => ({
      Date: item.date.toLocaleDateString(),
      Savings: item.savings,
      Investments: item.investments,
      Expenses: item.expenses,
      'Net Worth': item.netWorth,
      'Debt to Income': item.debtToIncome,
      'Savings Rate %': item.savingsRate
    }));

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      Object.keys(exportData[0]).join(',') + '\n' +
      exportData.map(row => Object.values(row).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_data_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataKeyColors = {
    savings: { stroke: '#4F46E5', fill: '#4F46E5' },
    investments: { stroke: '#10B981', fill: '#10B981' },
    expenses: { stroke: '#EF4444', fill: '#EF4444' },
    netWorth: { stroke: '#6366F1', fill: '#6366F1' },
    debtToIncome: { stroke: '#F59E0B', fill: '#F59E0B' },
    savingsRate: { stroke: '#8B5CF6', fill: '#8B5CF6' }
  };

  const intervals = {
    week: 7,
    month: 30,
    '3months': 90,
    '6months': 180,
    year: 365,
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return '0';
    return selectedDataKey === 'savingsRate' || selectedDataKey === 'debtToIncome'
      ? value.toFixed(2)
      : value.toLocaleString();
  };

  const calculatePercentageChange = (current: number | undefined, previous: number | undefined): string => {
    if (current === undefined || previous === undefined || previous === 0) return '0%';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <motion.div
      className="w-full h-[500px] bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(dataKeyColors).map(([key, colors]) => (
            <button
              key={key}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDataKey === key
                  ? `bg-${colors.fill} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedDataKey(key as any)}
            >
              {key.split(/(?=[A-Z])/).join(' ')}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          {(['week', 'month', '3months', '6months', 'year'] as DateRange[]).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedRange(range)}
            >
              {range === '3months' ? '3M' : range === '6months' ? '6M' : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              showComparison ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setShowComparison(!showComparison)}
          >
            Compare Periods
          </button>
          <button
            className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            onClick={handleExport}
          >
            Export CSV
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const currentValue = payload[0].value as number;
                const comparisonValue = showComparison 
                  ? comparisonData.find(d => d.name === label)?.[selectedDataKey]
                  : undefined;

                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p
                      className="text-sm"
                      style={{ color: payload[0].color }}
                    >
                      {selectedDataKey}: {selectedDataKey === 'savingsRate' ? '%' : '$'}
                      {formatValue(currentValue)}
                      {showComparison && typeof comparisonValue === 'number' && (
                        <span className="ml-2 text-gray-500">
                          vs {selectedDataKey === 'savingsRate' ? '%' : '$'}
                          {formatValue(comparisonValue)}
                          {' '}
                          ({calculatePercentageChange(currentValue, comparisonValue)})
                        </span>
                      )}
                    </p>
                    {selectedDataKey === 'netWorth' && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Savings Rate: {payload[0].payload.savingsRate?.toFixed(2)}%</p>
                        <p>Debt to Income: {payload[0].payload.debtToIncome?.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {showComparison && (
            <Area
              type="monotone"
              dataKey={selectedDataKey}
              data={comparisonData}
              stroke={`${dataKeyColors[selectedDataKey].stroke}80`}
              fill={`${dataKeyColors[selectedDataKey].fill}40`}
              strokeDasharray="5 5"
              name={`Previous ${selectedDataKey}`}
            />
          )}
          <Area
            type="monotone"
            dataKey={selectedDataKey}
            stroke={dataKeyColors[selectedDataKey].stroke}
            fill={dataKeyColors[selectedDataKey].fill}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}; 