import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'crypto' | 'mutual_fund' | 'etf' | 'real_estate';
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  lastUpdated: string;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
    total: number;
  };
}

const InvestmentsAnalysis: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/investments');
        const data = await response.json();
        setInvestments(data);
      } catch (err) {
        setError('Failed to fetch investments');
        console.error('Error fetching investments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const totalInvestment = investments.reduce(
    (total, inv) => total + inv.purchasePrice * inv.quantity,
    0
  );

  const currentValue = investments.reduce(
    (total, inv) => total + inv.currentPrice * inv.quantity,
    0
  );

  const totalReturn = ((currentValue - totalInvestment) / totalInvestment) * 100;

  const investmentsByType = investments.reduce((acc, inv) => {
    const value = inv.currentPrice * inv.quantity;
    acc[inv.type] = (acc[inv.type] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const topPerformers = [...investments]
    .sort((a, b) => b.performance.total - a.performance.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Value</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center">
              <span className={`text-sm ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">Total Return</span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Total Invested</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              ${totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Initial investment amount
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Total Gain/Loss</h2>
          </Card.Header>
          <Card.Body>
            <div className={`text-3xl font-bold ${currentValue - totalInvestment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(currentValue - totalInvestment).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {currentValue - totalInvestment >= 0 ? 'Total Gain' : 'Total Loss'}
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Allocation</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(investmentsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, value]) => {
                  const percentage = (value / currentValue) * 100;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
          </Card.Header>
          <Card.Body>
            <div className="divide-y divide-gray-200">
              {topPerformers.map(investment => (
                <div key={investment.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {investment.name} ({investment.symbol})
                    </h3>
                    <p className="text-xs text-gray-500">
                      {investment.type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      investment.performance.total >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {investment.performance.total >= 0 ? '+' : ''}
                      {investment.performance.total.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      ${investment.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <p className="py-4 text-gray-500 text-center">No investments found</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentsAnalysis; 