import React from 'react';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetAllocation } from './AssetAllocation';
import { PerformanceChart } from './PerformanceChart';
import { RecentTransactions } from './RecentTransactions';

export const PortfolioDashboard: React.FC = () => {
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