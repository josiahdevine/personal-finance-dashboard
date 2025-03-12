import React from 'react';
import Card from "../../common/card_component/Card";
import { useAccounts } from '../../../hooks/useAccounts';
import { formatCurrency } from '../../../utils/formatters';
import Button from "../../common/button/Button";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AccountType } from '../../../types/financial';

export const AccountSettings: React.FC = () => {
  const { accounts, deleteAccount, openEditModal, openAddModal } = useAccounts();

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Linked Accounts</h2>
        <Button
          variant="primary"
          onClick={openAddModal}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Account
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No accounts linked yet. Click "Add Account" to get started.
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    account.type === AccountType.CHECKING ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    {formatCurrency(account.balance)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => openEditModal(account)}
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
              </div>
            ))
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 