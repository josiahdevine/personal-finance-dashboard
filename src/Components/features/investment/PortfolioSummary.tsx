import React from 'react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { currencyFormatter } from '../../../utils/formatters';

export const PortfolioSummary: React.FC = () => {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-500">Error loading portfolio data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-gray-600">Total Value</p>
          <p className="text-2xl font-bold">{currencyFormatter(portfolio?.totalValue || 0)}</p>
        </div>
        <div>
          <p className="text-gray-600">Today's Change</p>
          <p className={`text-2xl font-bold ${(portfolio?.todayChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(portfolio?.todayChange ?? 0) >= 0 ? '+' : ''}{currencyFormatter(portfolio?.todayChange ?? 0)}
            <span className="text-base ml-1">
              ({portfolio?.todayChangePercent.toFixed(2)}%)
            </span>
          </p>
        </div>
        <div>
          <p className="text-gray-600">Total Return</p>
          <p className={`text-2xl font-bold ${(portfolio?.totalReturn ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(portfolio?.totalReturn ?? 0) >= 0 ? '+' : ''}{currencyFormatter(portfolio?.totalReturn ?? 0)}
            <span className="text-base ml-1">
              ({portfolio?.totalReturnPercent.toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}; 