import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { PlaidLink } from '../../components/plaid/PlaidLink';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';

interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number;
    limit?: number;
  };
  institution: string;
  status: 'active' | 'disconnected' | 'error';
  lastSync?: string;
  isManual: boolean;
}

interface Institution {
  id: string;
  name: string;
  logo?: string;
}

const AccountConnections: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      return data.accounts;
    },
  });

  const { data: institutions = [] } = useQuery<Institution[]>({
    queryKey: ['institutions'],
    queryFn: async () => {
      const response = await fetch('/api/plaid/institutions');
      if (!response.ok) {
        throw new Error('Failed to fetch institutions');
      }
      return response.json();
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}/sync`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to sync account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const handlePlaidSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    setIsPlaidModalOpen(false);
  };

  const getInstitutionName = (institutionId: string) => {
    const institution = institutions.find(i => i.id === institutionId);
    return institution?.name || 'Unknown Institution';
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.balances.current || 0);
  }, 0);

  const connectedInstitutions = new Set(
    accounts.filter(a => !a.isManual).map(a => a.institution)
  ).size;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Account Connections
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Manual Account
          </button>
          <button
            onClick={() => setIsPlaidModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <BanknotesIcon className="h-5 w-5 mr-2" />
            Connect Bank
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totalBalance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Connected Banks
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {connectedInstitutions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {accounts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accounts List */}
      {isLoadingAccounts ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {accounts.map((account) => (
              <li key={account.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BanknotesIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.name}
                          </h3>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            account.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : account.status === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {account.status}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {account.isManual ? 'Manual Account' : getInstitutionName(account.institution)}
                            {account.mask && ` •••• ${account.mask}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(account.balances.current)}
                        </p>
                        {account.balances.available !== null && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Available: {formatCurrency(account.balances.available)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!account.isManual && (
                          <button
                            onClick={() => syncMutation.mutate(account.id)}
                            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => disconnectMutation.mutate(account.id)}
                          className="p-2 text-red-400 hover:text-red-500"
                        >
                          <ExclamationCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Plaid Link Modal */}
      <Modal
        isOpen={isPlaidModalOpen}
        onClose={() => setIsPlaidModalOpen(false)}
        title="Connect Your Bank Account"
      >
        <div className="mt-4">
          <PlaidLink onSuccess={handlePlaidSuccess} />
        </div>
      </Modal>

      {/* Manual Account Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title={selectedAccount ? 'Edit Account' : 'Add Manual Account'}
      >
        <div className="mt-4">
          {/* Manual Account Form will go here */}
        </div>
      </Modal>
    </div>
  );
};

export default AccountConnections; 