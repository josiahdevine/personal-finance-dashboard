import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        // Temporary sample data until API is ready
        const sampleData: Investment[] = [
          {
            id: '1',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            quantity: 10,
            purchasePrice: 150.00,
            currentPrice: 175.50,
            type: 'stock',
            purchaseDate: '2024-01-01',
            lastUpdated: '2024-03-05T12:00:00Z',
            performance: {
              day: 0.5,
              week: 2.3,
              month: 5.8,
              year: 15.2,
              total: 17
            }
          },
          {
            id: '2',
            symbol: 'VTI',
            name: 'Vanguard Total Stock Market ETF',
            quantity: 20,
            purchasePrice: 200.00,
            currentPrice: 220.75,
            type: 'etf',
            purchaseDate: '2024-01-01',
            lastUpdated: '2024-03-05T12:00:00Z',
            performance: {
              day: 0.3,
              week: 1.5,
              month: 4.2,
              year: 12.8,
              total: 10.375
            }
          }
        ];
        
        setInvestments(sampleData);
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
        <motion.div 
          className="rounded-full h-12 w-12 border-b-2 border-indigo-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
      >
        {error}
      </motion.div>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
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
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
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
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
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
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
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
                      <motion.div 
                        key={type} 
                        className="space-y-2"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <motion.div
                            className="h-2 bg-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
            </Card.Header>
            <Card.Body>
              <div className="divide-y divide-gray-200">
                {topPerformers.map((investment, index) => (
                  <motion.div 
                    key={investment.id} 
                    className="py-4 flex justify-between items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
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
                  </motion.div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="py-4 text-gray-500 text-center">No investments found</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InvestmentsAnalysis;
