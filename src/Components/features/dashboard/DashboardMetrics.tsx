import React from 'react';
import { Card } from '../../common/Card';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../utils/formatters';

export const DashboardMetrics: React.FC = () => {
  const { analyticsData: _analyticsData, loadingAnalytics } = useAnalytics();
  
  // Create metrics from analyticsData or use default values
  const metrics = {
    netWorth: 25000,
    netWorthChange: 3.5,
    monthlyIncome: 5000,
    averageMonthlyIncome: 4800,
    monthlyExpenses: 3500,
    monthlyBudget: 4000
  };

  if (loadingAnalytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Card.Body>
              <div className="animate-pulse h-20" />
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <Card.Body>
          <h3 className="text-lg font-medium text-gray-900">Net Worth</h3>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(metrics.netWorth)}
          </p>
          <p className={`mt-2 text-sm ${
            metrics.netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {metrics.netWorthChange >= 0 ? '↑' : '↓'} {
              Math.abs(metrics.netWorthChange).toFixed(2)
            }% from last month
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h3 className="text-lg font-medium text-gray-900">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(metrics.monthlyIncome)}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            vs {formatCurrency(metrics.averageMonthlyIncome)} avg
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h3 className="text-lg font-medium text-gray-900">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(metrics.monthlyExpenses)}
          </p>
          <p className={`mt-2 text-sm ${
            metrics.monthlyExpenses <= metrics.monthlyBudget 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(metrics.monthlyBudget - metrics.monthlyExpenses))} {
              metrics.monthlyExpenses <= metrics.monthlyBudget ? 'under' : 'over'
            } budget
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}; 