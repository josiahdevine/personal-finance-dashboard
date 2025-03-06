import React from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </RechartsChart>
    </ResponsiveContainer>
  );
}; 