import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { currencyFormatter, dateFormatter } from '../../utils/formatters';
import BillForm from '../../components/features/bills/BillForm';
import Modal from '../../components/common/Modal';
import { BillFrequency } from '../../components/features/bills/BillForm';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  frequency?: BillFrequency;
  notes?: string;
  lastPaymentDate?: string;
}

export const Bills: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      const response = await fetch('/api/bills');
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      return response.json();
    },
  });

  const createBill = useMutation({
    mutationFn: async (data: Omit<Bill, 'id'>) => {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create bill');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsModalOpen(false);
    },
  });

  const updateBill = useMutation({
    mutationFn: async (data: Bill) => {
      const response = await fetch(`/api/bills/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update bill');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsModalOpen(false);
      setSelectedBill(null);
    },
  });

  const deleteBill = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const handleSubmit = async (data: Omit<Bill, 'id'>) => {
    if (selectedBill) {
      await updateBill.mutateAsync({ ...data, id: selectedBill.id });
    } else {
      await createBill.mutateAsync(data);
    }
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      await deleteBill.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bills</h1>
        <button
          onClick={() => {
            setSelectedBill(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{bill.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{bill.category}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bill)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Edit</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Delete</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencyFormatter(bill.amount)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Due: {dateFormatter(bill.dueDate)}
              </p>
              {bill.isRecurring && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recurring: {bill.frequency}
                </p>
              )}
              {bill.lastPaymentDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last paid: {dateFormatter(bill.lastPaymentDate)}
                </p>
              )}
              {bill.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notes: {bill.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBill(null);
        }}
        title={selectedBill ? 'Edit Bill' : 'Add Bill'}
      >
        <BillForm bill={selectedBill} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}; 