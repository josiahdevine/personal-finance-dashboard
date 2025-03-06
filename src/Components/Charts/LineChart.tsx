import React from 'react';
import {
  LineChart as RechartsChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  yFormatter?: (value: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  yFormatter,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickFormatter={yFormatter}
        />
        <Tooltip
          formatter={yFormatter}
          contentStyle={{
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </RechartsChart>
    </ResponsiveContainer>
  );
}; 