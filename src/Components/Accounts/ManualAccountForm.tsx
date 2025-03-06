import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['checking', 'savings', 'credit', 'investment', 'loan', 'other']),
  balance: z.number().min(0, 'Balance must be a positive number'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

interface ManualAccountFormProps {
  account?: {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    notes?: string;
  };
  onSubmit: (data: AccountFormData) => void;
}

const ManualAccountForm: React.FC<ManualAccountFormProps> = ({ account, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account ? {
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      notes: account.notes
    } : {
      currency: 'USD',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select an account type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit Card</option>
          <option value="investment">Investment</option>
          <option value="loan">Loan</option>
          <option value="other">Other</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Balance
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="balance"
            step="0.01"
            {...register('balance', { valueAsNumber: true })}
            className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {errors.balance && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.balance.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Currency
        </label>
        <select
          id="currency"
          {...register('currency')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
          <option value="JPY">JPY - Japanese Yen</option>
        </select>
        {errors.currency && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currency.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
        </button>
      </div>
    </form>
  );
};

export default ManualAccountForm; 