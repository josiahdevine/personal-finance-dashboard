import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Card from "../../common/Card";
import { formatCurrency } from '../../../utils/formatters';
import PlaidService from '../../../services/plaidService';
import { useAuth } from '../../../hooks/useAuth';

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
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const accountsData = await PlaidService.getAccounts();
        setAccounts(accountsData);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [user?.id]);

  // Generate monthly net worth data (this would ideally come from a real calculation)
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // If we have real account data, use the total balance as the latest month
    const latestMonthValue = accounts.reduce((sum, account) => sum + account.balance.current, 0);
    
    // Generate some realistic looking data for previous months
    return months.map((_, index) => {
      if (index === months.length - 1) return latestMonthValue;
      // Generate slightly lower values for previous months
      return latestMonthValue * (0.85 + (index * 0.03));
    });
  };

  const data: NetWorthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Net Worth',
        data: generateMonthlyData(),
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
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Net Worth Trend</h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <Line data={data} options={options} />
        )}
      </Card.Body>
    </Card>
  );
}; 