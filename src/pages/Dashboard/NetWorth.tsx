import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTimeFrame } from '../../contexts/TimeFrameContext';
import { formatCurrency } from '../../utils/formatters';
import { TimeFrameSelector } from '../../components/common/TimeFrameSelector';
import { BalanceHistoryChart } from '../../components/charts/BalanceHistoryChart';

interface NetWorthData {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

interface AccountBalance {
  type: 'asset' | 'liability';
  name: string;
  balance: number;
  change: number;
  changePercentage: number;
}

const NetWorth: React.FC = () => {
  const { timeFrame } = useTimeFrame();

  const { data: netWorthHistory = [], isLoading: isLoadingHistory } = useQuery<NetWorthData[]>({
    queryKey: ['netWorth', 'history', timeFrame],
    queryFn: async () => {
      const response = await fetch(`/api/net-worth/history?timeFrame=${timeFrame}`);
      if (!response.ok) {
        throw new Error('Failed to fetch net worth history');
      }
      return response.json();
    },
  });

  const { data: accountBalances = [], isLoading: isLoadingBalances } = useQuery<AccountBalance[]>({
    queryKey: ['netWorth', 'accounts', timeFrame],
    queryFn: async () => {
      const response = await fetch(`/api/net-worth/accounts?timeFrame=${timeFrame}`);
      if (!response.ok) {
        throw new Error('Failed to fetch account balances');
      }
      return response.json();
    },
  });

  const currentNetWorth = netWorthHistory[netWorthHistory.length - 1]?.netWorth || 0;
  const previousNetWorth = netWorthHistory[netWorthHistory.length - 2]?.netWorth || 0;
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercentage = previousNetWorth ? (netWorthChange / previousNetWorth) * 100 : 0;

  const totalAssets = accountBalances
    .filter(account => account.type === 'asset')
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = accountBalances
    .filter(account => account.type === 'liability')
    .reduce((sum, account) => sum + account.balance, 0);

  // Format data for BalanceHistoryChart component
  const balanceHistoryData = netWorthHistory.map(item => ({
    date: item.date,
    amount: item.netWorth
  }));

  if (isLoadingHistory || isLoadingBalances) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Net Worth Tracker</h1>
        <TimeFrameSelector />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Worth</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentNetWorth)}
          </p>
          <div className={`mt-2 flex items-center text-sm ${
            netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{netWorthChange >= 0 ? '↑' : '↓'}</span>
            <span className="ml-1">
              {formatCurrency(Math.abs(netWorthChange))} ({Math.abs(netWorthChangePercentage).toFixed(2)}%)
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Liabilities</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Debt-to-Asset Ratio</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {totalAssets ? (totalLiabilities / totalAssets * 100).toFixed(1) : 0}%
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BalanceHistoryChart
          data={balanceHistoryData}
          title="Net Worth Over Time"
          height={400}
          showLegend={true}
          gradientColor="rgba(59, 130, 246, 0.2)"
          lineColor="rgb(59, 130, 246)"
        />
      </div>

      {/* Account Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assets</h3>
            <div className="mt-6 space-y-4">
              {accountBalances
                .filter(account => account.type === 'asset')
                .map(account => (
                  <div key={account.name} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</p>
                      <div className={`text-sm ${
                        account.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.change >= 0 ? '↑' : '↓'} {Math.abs(account.changePercentage).toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Liabilities</h3>
            <div className="mt-6 space-y-4">
              {accountBalances
                .filter(account => account.type === 'liability')
                .map(account => (
                  <div key={account.name} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</p>
                      <div className={`text-sm ${
                        account.change <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.change <= 0 ? '↓' : '↑'} {Math.abs(account.changePercentage).toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorth;