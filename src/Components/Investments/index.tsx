import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  type: 'stock' | 'etf' | 'crypto' | 'mutual_fund';
  lastUpdated: string;
}

interface Position {
  investment: Investment;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

const InvestmentPortfolio: React.FC = () => {
  const [investments] = useState<Investment[]>([
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 10,
      averageCost: 150.00,
      currentPrice: 175.50,
      type: 'stock',
      lastUpdated: '2024-03-05T12:00:00Z',
    },
    {
      id: '2',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      shares: 20,
      averageCost: 200.00,
      currentPrice: 220.75,
      type: 'etf',
      lastUpdated: '2024-03-05T12:00:00Z',
    },
    {
      id: '3',
      symbol: 'BTC',
      name: 'Bitcoin',
      shares: 0.5,
      averageCost: 35000.00,
      currentPrice: 42000.00,
      type: 'crypto',
      lastUpdated: '2024-03-05T12:00:00Z',
    },
  ]);

  const positions: Position[] = investments.map(investment => ({
    investment,
    marketValue: investment.shares * investment.currentPrice,
    gainLoss: (investment.currentPrice - investment.averageCost) * investment.shares,
    gainLossPercentage: ((investment.currentPrice - investment.averageCost) / investment.averageCost) * 100,
  }));

  const totalValue = positions.reduce((sum, position) => sum + position.marketValue, 0);
  const totalGainLoss = positions.reduce((sum, position) => sum + position.gainLoss, 0);
  const totalGainLossPercentage = (totalGainLoss / (totalValue - totalGainLoss)) * 100;

  const getAssetTypeIcon = (type: Investment['type']) => {
    switch (type) {
      case 'stock':
        return '📈';
      case 'etf':
        return '📊';
      case 'crypto':
        return '₿';
      case 'mutual_fund':
        return '💰';
      default:
        return '🔸';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Investment Portfolio</h1>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Value</h2>
            <p className="text-2xl font-bold text-indigo-600">
              ${totalValue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Gain/Loss</h2>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalGainLoss.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Return</h2>
            <p className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map(position => (
                <tr key={position.investment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">
                        {getAssetTypeIcon(position.investment.type)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {position.investment.symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {position.investment.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {position.investment.shares.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${position.investment.averageCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${position.investment.currentPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${position.marketValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${
                        position.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${position.gainLoss.toLocaleString()}
                      </span>
                      <span className={`text-xs ${
                        position.gainLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {position.gainLossPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Investment Button */}
        <motion.button
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InvestmentPortfolio; 