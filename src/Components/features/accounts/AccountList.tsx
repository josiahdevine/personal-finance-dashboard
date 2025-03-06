import React from 'react';
import { createTable } from '../../common/Table/tableFactory';
import { usePlaid } from '../../../contexts/PlaidContext';
import { PlaidAccount } from '../../../types/models';

const AccountsTable = createTable<PlaidAccount>(
  [
    { 
      key: 'name',
      header: 'Account Name',
      sortable: true 
    },
    { 
      key: 'type',
      header: 'Type',
      sortable: true 
    },
    { 
      key: 'balance',
      header: 'Balance',
      render: (account) => `$${account.balance.current.toFixed(2)}`,
      sortable: true 
    },
    {
      key: 'institution',
      header: 'Institution',
      render: (account) => account.institution_name
    }
  ],
  {
    rowKey: (account) => account.id,
    defaultSort: { key: 'name', direction: 'asc' }
  }
);

export const AccountList: React.FC = () => {
  const { accounts, isLoading } = usePlaid();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Connected Accounts</h2>
      <AccountsTable data={accounts} loading={isLoading} />
    </div>
  );
}; 