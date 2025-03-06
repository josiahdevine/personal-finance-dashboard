import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { usePlaid } from '../../../contexts/PlaidContext';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';

export const CashFlowAnalysis: React.FC = () => {
  const { transactions } = usePlaid();

  const monthlyData = useMemo(() => {
    const data: Record<string, { income: number; expenses: number }> = {};
    
    transactions?.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!data[monthKey]) {
        data[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.amount > 0) {
        data[monthKey].income += transaction.amount;
      } else {
        data[monthKey].expenses += Math.abs(transaction.amount);
      }
    });

    return data;
  }, [transactions]);

  const data = {
    labels: Object.keys(monthlyData).sort(),
    datasets: [
      {
        label: 'Income',
        data: Object.keys(monthlyData)
          .sort()
          .map(key => monthlyData[key].income),
        backgroundColor: '#10B981',
      },
      {
        label: 'Expenses',
        data: Object.keys(monthlyData)
          .sort()
          .map(key => monthlyData[key].expenses),
        backgroundColor: '#EF4444',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
      </Card.Header>
      <Card.Body>
        <Bar data={data} options={options} />
      </Card.Body>
    </Card>
  );
}; 