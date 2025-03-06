import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAccounts } from '../hooks/useAccounts';
import { AccountAggregationService, AccountSummary } from '../services/AccountAggregationService';
import { useAuth } from '../hooks/useAuth';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface NetWorthHistory {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export const NetWorthApplet: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<AccountSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const accountService = AccountAggregationService.getInstance();
        const data = await accountService.getAccountSummary(user.id);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch account summary'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [user, accounts]);

  const history: NetWorthHistory[] = useMemo(() => {
    if (!accounts || !summary) return [];

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toISOString().slice(0, 7);
    });

    return months.map(month => ({
      date: month,
      assets: summary.totalBalance,
      liabilities: summary.totalDebt,
      netWorth: summary.netWorth
    }));
  }, [accounts, summary]);

  const monthlyChange = useMemo(() => {
    if (history.length < 2) return 0;
    const currentMonth = history[history.length - 1];
    const previousMonth = history[history.length - 2];
    return ((currentMonth.netWorth - previousMonth.netWorth) / previousMonth.netWorth) * 100;
  }, [history]);

  const netWorthHistoryData: ChartData<'line'> = useMemo(() => history.length === 0 ? {
    labels: [],
    datasets: [{
      label: 'Net Worth',
      data: [],
      borderColor: '#10B981',
      backgroundColor: '#10B981',
      tension: 0.4,
    }]
  } : ({
    labels: history.map(h => h.date),
    datasets: [
      {
        label: 'Net Worth',
        data: history.map(h => h.netWorth),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.4,
      },
    ],
  }), [history]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false,
      },
      x: {
        display: false,
      },
    },
  }), []);

  if (isLoading || !summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-500">Error loading net worth data</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200" 
      onClick={() => navigate('/dashboard/net-worth')}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Net Worth</h3>
          <p className="text-sm text-gray-500">Total Assets & Liabilities</p>
        </div>
        <div className={`px-2.5 py-1.5 text-sm font-medium rounded-full ${
          monthlyChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100">
            <BanknotesIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Assets</p>
            <p className="text-lg font-semibold text-gray-900">${summary.totalBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-pink-100">
            <BuildingLibraryIcon className="h-6 w-6 text-pink-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Liabilities</p>
            <p className="text-lg font-semibold text-gray-900">${summary.totalDebt.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">Net Worth</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">${summary.netWorth.toLocaleString()}</span>
      </div>

      <div className="h-24">
        <Line data={netWorthHistoryData} options={chartOptions} />
      </div>

      <div className="mt-4 flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-500">
        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
        View Details
      </div>
    </div>
  );
};
