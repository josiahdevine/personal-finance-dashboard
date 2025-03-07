import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  isPaid: boolean;
}

const BillsAnalysis: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBill, setNewBill] = useState<Omit<Bill, 'id'>>({
    name: '',
    amount: 0,
    dueDate: '',
    category: '',
    frequency: 'monthly',
    autoPay: false,
    reminderDays: 7,
    isPaid: false,
  });

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

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    setBills([...bills, { ...newBill, id: Date.now().toString() }]);
    setNewBill({
      name: '',
      amount: 0,
      dueDate: '',
      category: '',
      frequency: 'monthly',
      autoPay: false,
      reminderDays: 7,
      isPaid: false,
    });
  };

  const togglePaidStatus = (id: string) => {
    setBills(bills.map(bill => 
      bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
    ));
  };

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

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = totalBills - paidBills;

  const upcomingBills = bills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bills Analysis</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <h2 className="text-lg font-semibold text-gray-900">Paid Bills</h2>
            </Card.Header>
            <Card.Body>
              <div className="text-3xl font-bold text-green-600">
                ${paidBills.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-500 mt-2">Total paid</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Unpaid Bills</h2>
            </Card.Header>
            <Card.Body>
              <div className="text-3xl font-bold text-red-600">
                ${unpaidBills.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-500 mt-2">Total unpaid</p>
            </Card.Body>
          </Card>
        </div>

        {/* Add New Bill Form */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Add New Bill</h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleAddBill} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Bill Name"
                value={newBill.name}
                onChange={e => setNewBill({ ...newBill, name: e.target.value })}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newBill.amount || ''}
                onChange={e => setNewBill({ ...newBill, amount: parseFloat(e.target.value) })}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
                min="0"
                step="0.01"
              />
              <input
                type="date"
                value={newBill.dueDate}
                onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newBill.category}
                onChange={e => setNewBill({ ...newBill, category: e.target.value })}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              <select
                value={newBill.frequency}
                onChange={e => setNewBill({ ...newBill, frequency: e.target.value as Bill['frequency'] })}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newBill.autoPay}
                    onChange={e => setNewBill({ ...newBill, autoPay: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Auto Pay</span>
                </label>
                <input
                  type="number"
                  placeholder="Reminder Days"
                  value={newBill.reminderDays}
                  onChange={e => setNewBill({ ...newBill, reminderDays: parseInt(e.target.value) })}
                  className="w-24 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <button
                type="submit"
                className="md:col-span-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Bill
              </button>
            </form>
          </Card.Body>
        </Card>

        {/* Bills by Category */}
        <Card className="mb-8">
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

        {/* Upcoming Bills */}
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
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">{bill.frequency}</div>
                    </div>
                    <button
                      onClick={() => togglePaidStatus(bill.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        bill.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bill.isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </div>
                </div>
              ))}
              {upcomingBills.length === 0 && (
                <p className="py-4 text-gray-500 text-center">No upcoming bills in the next 7 days</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default BillsAnalysis; 