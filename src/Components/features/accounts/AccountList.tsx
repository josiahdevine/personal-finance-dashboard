import React from 'react';
// import { createTable } from '../../common/Table/tableFactory';
// import { usePlaid } from '../../../contexts/PlaidContext';
import { PlaidAccount } from '../../../types/models';

// Mock implementation of usePlaid
const usePlaid = () => {
  return {
    accounts: [] as PlaidAccount[],
    isLoading: false,
    error: null,
    refreshAccounts: () => {
      // This is a mock implementation
    }
  };
};

// Mock table component
const AccountsTable: React.FC<{ data: PlaidAccount[], isLoading: boolean }> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((account) => (
          <tr key={account.id}>
            <td className="px-6 py-4 whitespace-nowrap">{account.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{account.type}</td>
            <td className="px-6 py-4 whitespace-nowrap">${account.balance.current.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{account.institutionName}</td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No accounts found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export const AccountList: React.FC = () => {
  const { accounts, isLoading } = usePlaid();
  
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
      <AccountsTable 
        data={accounts} 
        isLoading={isLoading} 
      />
    </div>
  );
}; 