import React from 'react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">PieChart</h2>
      <p>This is a placeholder component for PieChart.</p>
      {data && (
        <div className="mt-2">
          <p>Data items: {data.length}</p>
        </div>
      )}
    </div>
  );
};

export default PieChart;
