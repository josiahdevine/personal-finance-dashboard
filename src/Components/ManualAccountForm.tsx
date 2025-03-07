import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ManualAccountFormData {
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'other';
  balance: number;
  currency: string;
  institution_name: string;
  notes?: string;
}

interface ManualAccountFormProps {
  onSubmit: (accountData: ManualAccountFormData) => Promise<void>;
  onCancel?: () => void;
}

export const ManualAccountForm: React.FC<ManualAccountFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ManualAccountFormData>({
    account_name: '',
    account_type: 'checking',
    balance: 0,
    currency: 'USD',
    institution_name: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error adding manual account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Manual Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            type="text"
            id="accountName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <select
            id="accountType"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value as ManualAccountFormData['account_type'] })}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit_card">Credit Card</option>
            <option value="investment">Investment</option>
            <option value="loan">Loan</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
            Current Balance
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="balance"
              required
              step="0.01"
              min="0"
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
            Institution Name
          </label>
          <input
            type="text"
            id="institution"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.institution_name}
            onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  );
};
