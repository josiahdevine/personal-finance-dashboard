import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from '../../common/Card';
// import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartOptions } from 'chart.js';
import PlaidService from '../../../services/PlaidService';
import { useAuth } from '../../../hooks/useAuth';

interface TrendData {
  labels: string[];
  income: number[];
  expenses: number[];
  savings: number[];
}

export const TrendAnalysis: React.FC = () => {
  // const { analyticsData, loadingAnalytics } = useAnalytics();
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<TrendData>({
    labels: [],
    income: [],
    expenses: [],
    savings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get the last 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        
        // Format dates as YYYY-MM-DD
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fetch transactions
        const transactions = await PlaidService.getTransactions(
          user.id,
          startDateStr,
          endDateStr
        );
        
        // Process transactions into monthly data
        const monthlyData: Record<string, { income: number, expenses: number }> = {};
        
        // Initialize the last 6 months
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
          monthlyData[monthKey] = { income: 0, expenses: 0 };
        }
        
        // Aggregate transactions by month
        transactions.forEach(transaction => {
          const monthKey = transaction.date.slice(0, 7);
          if (monthlyData[monthKey]) {
            if (transaction.amount < 0) {
              // Income (negative amount in Plaid means money coming in)
              monthlyData[monthKey].income += Math.abs(transaction.amount);
            } else {
              // Expense
              monthlyData[monthKey].expenses += transaction.amount;
            }
          }
        });
        
        // Convert to arrays for chart
        const sortedMonths = Object.keys(monthlyData).sort();
        const labels = sortedMonths.map(month => {
          const date = new Date(month + '-01');
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        const income = sortedMonths.map(month => monthlyData[month].income);
        const expenses = sortedMonths.map(month => monthlyData[month].expenses);
        const savings = sortedMonths.map(month => 
          monthlyData[month].income - monthlyData[month].expenses
        );
        
        setTrendData({ labels, income, expenses, savings });
      } catch (err) {
        console.error('Error fetching transaction data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionData();
  }, [user?.id]);

  const chartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Income',
        data: trendData.income,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: trendData.expenses,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Savings',
        data: trendData.savings,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          }
        }
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-medium">Financial Trends</h2>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        ) : (
          <Line data={chartData} options={options} height={64} />
        )}
      </Card.Body>
    </Card>
  );
}; 