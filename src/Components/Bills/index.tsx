import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
  autoPay: boolean;
  reminderDays: number;
}

const BillsAnalysis: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/bills');
        const data = await response.json();
        setBills(data);
      } catch (err) {
        setError('Failed to fetch bills');
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
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

  const totalMonthlyBills = bills.reduce((total, bill) => {
    let monthlyAmount = bill.amount;
    switch (bill.frequency) {
      case 'daily':
        monthlyAmount *= 30;
        break;
      case 'weekly':
        monthlyAmount *= 4;
        break;
      case 'yearly':
        monthlyAmount /= 12;
        break;
    }
    return total + monthlyAmount;
  }, 0);

  const upcomingBills = bills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Bills Summary</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-3xl font-bold text-indigo-600">
              ${totalMonthlyBills.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 mt-2">Total monthly bills</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Bills by Category</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(
                bills.reduce((acc, bill) => {
                  acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
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
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Bills</h2>
        </Card.Header>
        <Card.Body>
          <div className="divide-y divide-gray-200">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{bill.name}</h3>
                  <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">{bill.frequency}</div>
                </div>
              </div>
            ))}
            {upcomingBills.length === 0 && (
              <p className="py-4 text-gray-500 text-center">No upcoming bills in the next 7 days</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BillsAnalysis; 