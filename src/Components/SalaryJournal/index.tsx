import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface SalaryEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  category: string;
  description: string;
  isRecurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
}

const SalaryJournal: React.FC = () => {
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalaryEntries = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/salary-entries');
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError('Failed to fetch salary entries');
        console.error('Error fetching salary entries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryEntries();
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

  const totalMonthlyIncome = entries.reduce((total, entry) => {
    let monthlyAmount = entry.amount;
    if (entry.isRecurring && entry.frequency) {
      switch (entry.frequency) {
        case 'weekly':
          monthlyAmount *= 4;
          break;
        case 'biweekly':
          monthlyAmount *= 2;
          break;
        case 'yearly':
          monthlyAmount /= 12;
          break;
      }
    }
    return total + monthlyAmount;
  }, 0);

  const incomeBySource = entries.reduce((acc, entry) => {
    acc[entry.source] = (acc[entry.source] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Income Summary</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-green-600">
              ${totalMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 mt-2">Total monthly income</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Income by Source</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(incomeBySource).map(([source, amount]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-gray-600">{source}</span>
                  <span className="font-medium">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
        </Card.Header>
        <Card.Body>
          <div className="divide-y divide-gray-200">
            {recentEntries.map(entry => (
              <div key={entry.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{entry.source}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} - {entry.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  {entry.isRecurring && (
                    <div className="text-xs text-gray-500">
                      Recurring ({entry.frequency})
                    </div>
                  )}
                </div>
              </div>
            ))}
            {recentEntries.length === 0 && (
              <p className="py-4 text-gray-500 text-center">No recent salary entries</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalaryJournal; 