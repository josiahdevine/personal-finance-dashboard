import React from 'react';
import { useAccounts } from '../../../hooks/useAccounts';
import Card from '../../common/Card';
import Button from '../../common/button/Button';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/outline';
import { formatCurrency } from '../../../utils/formatters';

export const AccountSettings: React.FC = () => {
  const { accounts, deleteAccount, openEditModal, openAddModal } = useAccounts();

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Linked Accounts</h2>
        <Button
          variant="primary"
          onClick={openAddModal}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Account
        </Button>
      </div>
      <div className="p-4">
        {accounts && accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
              >
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-gray-500">
                    {account.type || 'Account'}
                  </p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(account.balance || 0)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => openEditModal(account.id)}
                    className="p-2"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => deleteAccount(account.id)}
                    className="p-2"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No accounts linked yet</p>
            <Button
              variant="primary"
              onClick={openAddModal}
              className="inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Link Your First Account
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AccountSettings; 