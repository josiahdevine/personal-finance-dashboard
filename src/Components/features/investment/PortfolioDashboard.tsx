import React from 'react';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetAllocation } from './AssetAllocation';
import { PerformanceChart } from './PerformanceChart';
import { RecentTransactions } from './RecentTransactions';

interface PortfolioDashboardProps {
  accountIds: string[];
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ accountIds: _accountIds }) => {
  // TODO: Use accountIds to filter portfolio data
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="col-span-1 md:col-span-2">
        <PortfolioSummary />
      </div>
      <div>
        <AssetAllocation />
      </div>
      <div>
        <PerformanceChart />
      </div>
      <div className="col-span-1 md:col-span-2">
        <RecentTransactions />
      </div>
    </div>
  );
}; 