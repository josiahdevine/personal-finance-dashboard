import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SalaryEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  salary: number;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  bonuses: number;
  benefits: string[];
  notes?: string;
}

const SalaryJournal: React.FC = () => {
  const [entries, setEntries] = useState<SalaryEntry[]>([
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2023-01-01',
      salary: 120000,
      paymentFrequency: 'bi-weekly',
      bonuses: 15000,
      benefits: ['Health Insurance', '401k', 'Stock Options'],
      notes: 'Annual performance review in December',
    },
  ]);

  const [newEntry, setNewEntry] = useState<Omit<SalaryEntry, 'id'>>({
    company: '',
    position: '',
    startDate: '',
    salary: 0,
    paymentFrequency: 'monthly',
    bonuses: 0,
    benefits: [],
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries([...entries, { ...newEntry, id: Date.now().toString() }]);
    setNewEntry({
      company: '',
      position: '',
      startDate: '',
      salary: 0,
      paymentFrequency: 'monthly',
      bonuses: 0,
      benefits: [],
    });
  };

  const calculateTotalCompensation = (entry: SalaryEntry) => {
    return entry.salary + entry.bonuses;
  };

  const calculateMonthlyIncome = (entry: SalaryEntry) => {
    const annualSalary = entry.salary;
    switch (entry.paymentFrequency) {
      case 'weekly':
        return annualSalary / 52 * 4.33;
      case 'bi-weekly':
        return annualSalary / 26 * 2;
      case 'monthly':
      default:
        return annualSalary / 12;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Salary Journal</h1>

        {/* Add New Entry Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Entry</h2>
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company"
              value={newEntry.company}
              onChange={e => setNewEntry({ ...newEntry, company: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Position"
              value={newEntry.position}
              onChange={e => setNewEntry({ ...newEntry, position: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newEntry.startDate}
              onChange={e => setNewEntry({ ...newEntry, startDate: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Annual Salary"
              value={newEntry.salary || ''}
              onChange={e => setNewEntry({ ...newEntry, salary: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <select
              value={newEntry.paymentFrequency}
              onChange={e => setNewEntry({ ...newEntry, paymentFrequency: e.target.value as 'monthly' | 'bi-weekly' | 'weekly' })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="weekly">Weekly</option>
            </select>
            <input
              type="number"
              placeholder="Bonuses"
              value={newEntry.bonuses || ''}
              onChange={e => setNewEntry({ ...newEntry, bonuses: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-md"
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>

        {/* Salary Entries */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Compensation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{entry.company}</div>
                      <div className="text-sm text-gray-500">{entry.position}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(entry.startDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${entry.salary.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${calculateMonthlyIncome(entry).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-indigo-600">
                      ${calculateTotalCompensation(entry).toLocaleString()}
                    </div>
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

export default SalaryJournal; 