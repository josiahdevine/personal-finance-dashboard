import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

interface SpendingData {
  date: string;
  amount: number;
  category: string;
}

interface SpendingTrendChartProps {
  data: SpendingData[];
  height?: number;
  showLegend?: boolean;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  height = 400,
  showLegend = true,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    data.forEach((item) => uniqueCategories.add(item.category));
    return Array.from(uniqueCategories);
  }, [data]);

  const processedData = useMemo(() => {
    const dateMap = new Map<string, { [key: string]: number }>();
    
    data.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {});
      }
      const dateEntry = dateMap.get(item.date)!;
      dateEntry[item.category] = (dateEntry[item.category] || 0) + item.amount;
    });

    return Array.from(dateMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }, [data]);

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF7C43',
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filteredCategories = selectedCategories.size > 0
    ? categories.filter(cat => selectedCategories.has(cat))
    : categories;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={processedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {categories.map((category, index) => (
              <linearGradient
                key={category}
                id={`color-${category}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name,
            ]}
          />
          {showLegend && (
            <Legend
              onClick={(e) => toggleCategory(e.value)}
              wrapperStyle={{ cursor: 'pointer' }}
            />
          )}
          {filteredCategories.map((category, index) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stackId="1"
              stroke={COLORS[index % COLORS.length]}
              fill={`url(#color-${category})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}; 