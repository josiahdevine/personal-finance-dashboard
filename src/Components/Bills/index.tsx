<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
=======
import React, { useState } from 'react';
import { motion } from 'framer-motion';
>>>>>>> 234e2586c127906a5f392b4d4ea17df505736af7

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
<<<<<<< HEAD
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
=======
  category: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'yearly' | 'weekly';
  isPaid: boolean;
}

const BillsAnalysis: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: '1',
      name: 'Rent',
      amount: 1200,
      dueDate: '2024-03-15',
      category: 'Housing',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: false,
    },
    {
      id: '2',
      name: 'Internet',
      amount: 79.99,
      dueDate: '2024-03-10',
      category: 'Utilities',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: true,
    },
  ]);

  const [newBill, setNewBill] = useState<Omit<Bill, 'id'>>({
    name: '',
    amount: 0,
    dueDate: '',
    category: '',
    isRecurring: false,
    isPaid: false,
  });

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    setBills([...bills, { ...newBill, id: Date.now().toString() }]);
    setNewBill({
      name: '',
      amount: 0,
      dueDate: '',
      category: '',
      isRecurring: false,
      isPaid: false,
    });
  };

  const togglePaidStatus = (id: string) => {
    setBills(bills.map(bill => 
      bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
    ));
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = totalBills - paidBills;

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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Bills</h2>
            <p className="text-2xl font-bold text-indigo-600">
              ${totalBills.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Paid</h2>
            <p className="text-2xl font-bold text-green-600">
              ${paidBills.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Unpaid</h2>
            <p className="text-2xl font-bold text-red-600">
              ${unpaidBills.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Add New Bill Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Bill</h2>
          <form onSubmit={handleAddBill} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Bill Name"
              value={newBill.name}
              onChange={e => setNewBill({ ...newBill, name: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={newBill.amount || ''}
              onChange={e => setNewBill({ ...newBill, amount: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="date"
              value={newBill.dueDate}
              onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newBill.category}
              onChange={e => setNewBill({ ...newBill, category: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newBill.isRecurring}
                onChange={e => setNewBill({ ...newBill, isRecurring: e.target.checked })}
                className="mr-2"
              />
              <label>Recurring Bill</label>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Bill
            </button>
          </form>
        </div>

        {/* Bills List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {bill.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${bill.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bill.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePaidStatus(bill.id)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        bill.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bill.isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
>>>>>>> 234e2586c127906a5f392b4d4ea17df505736af7
    </div>
  );
};

export default BillsAnalysis; 