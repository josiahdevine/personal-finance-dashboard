import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
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
    </div>
  );
};

export default BillsAnalysis; 