import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from '../../common/Card';
import { useAppContext } from '../../../contexts/AppContext';
import { formatCurrency } from '../../../utils/formatters';

interface NetWorthData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export const NetWorthChart: React.FC = () => {
  const { state } = useAppContext();
  const { accounts } = state.plaid;

  const data: NetWorthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Net Worth',
        data: accounts.map(account => account.balance.current),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Net Worth: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Net Worth Trend</h2>
      </Card.Header>
      <Card.Body>
        <Line data={data} options={options} />
      </Card.Body>
    </Card>
  );
}; 