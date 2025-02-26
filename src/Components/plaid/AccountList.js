import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Badge, Button, Modal } from '../ui';
import PlaidLink from './PlaidLink';

/**
 * Account status badge component
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Account status (good, error, pending, disconnected)
 * @returns {JSX.Element} Status badge
 */
const AccountStatusBadge = ({ status }) => {
  const statusConfig = {
    good: { variant: 'success', label: 'Connected', dot: true },
    error: { variant: 'danger', label: 'Error', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    disconnected: { variant: 'default', label: 'Disconnected', dot: false },
  };
  
  const config = statusConfig[status] || statusConfig.disconnected;
  
  return (
    <Badge 
      variant={config.variant} 
      withDot={config.dot}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

AccountStatusBadge.propTypes = {
  status: PropTypes.oneOf(['good', 'error', 'pending', 'disconnected']).isRequired,
};

/**
 * AccountList component displays connected financial accounts
 * 
 * @param {Object} props - Component props
 * @param {Array} props.accounts - List of connected accounts
 * @param {string} props.userId - User ID for account operations
 * @param {Function} props.onUpdate - Called when an account is updated/reconnected
 * @param {Function} props.onRemove - Called when an account is removed
 * @param {boolean} [props.isLoading=false] - Whether the accounts are loading
 * @returns {JSX.Element} AccountList component
 */
const AccountList = ({ 
  accounts = [], 
  userId, 
  onUpdate, 
  onRemove,
  isLoading = false,
  errorMessage
}) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  // Function to get account status
  const getAccountStatus = (account) => {
    if (!account.status) return 'disconnected';
    
    switch (account.status.toLowerCase()) {
      case 'active':
      case 'connected':
      case 'good':
        return 'good';
      case 'error':
      case 'failed':
        return 'error';
      case 'pending':
      case 'pending_expiration':
        return 'pending';
      default:
        return 'disconnected';
    }
  };
  
  // Handle account removal
  const handleRemove = async () => {
    if (selectedAccount && onRemove) {
      await onRemove(selectedAccount.id);
      setIsRemoveModalOpen(false);
      setSelectedAccount(null);
    }
  };
  
  // Handle account update success
  const handleUpdateSuccess = (result, metadata) => {
    if (onUpdate) {
      onUpdate(selectedAccount.id, result, metadata);
    }
    setSelectedAccount(null);
  };
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <div className="py-6 flex justify-center items-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  if (accounts.length === 0) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No financial accounts connected yet.</p>
            <PlaidLink
              userId={userId}
              onSuccess={onUpdate}
              buttonText="Connect Your First Account"
            />
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="mt-4">
        {isLoading ? (
          <div className="w-full flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : errorMessage ? (
          <div className="text-red-500 text-center">{errorMessage}</div>
        ) : (
          <div>
            {Array.isArray(accounts) && accounts.length > 0 ? (
              accounts.map(account => {
                const status = getAccountStatus(account);
                const hasError = status === 'error';
                
                return (
                  <Card key={account.id} className={hasError ? 'border-red-200' : ''}>
                    <Card.Body>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex items-start space-x-3">
                          {account.institution?.logo && (
                            <img 
                              src={account.institution.logo} 
                              alt={`${account.institution.name} logo`} 
                              className="w-10 h-10 object-contain rounded"
                            />
                          )}
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{account.institution?.name || 'Financial Institution'}</h3>
                              <AccountStatusBadge status={status} />
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              {account.mask ? `••••${account.mask}` : 'Account'} • {account.subtype || account.type || 'Bank Account'}
                            </p>
                            
                            {hasError && account.errorMessage && (
                              <p className="text-sm text-red-600 mt-1">{account.errorMessage}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                          {hasError && (
                            <PlaidLink
                              userId={userId}
                              onSuccess={(result, metadata) => handleUpdateSuccess(result, metadata)}
                              buttonText="Fix Connection"
                              buttonVariant="outline"
                              isUpdateMode={true}
                              accessToken={account.accessToken}
                              itemId={account.itemId}
                              institutionId={account.institution?.id}
                            />
                          )}
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setIsRemoveModalOpen(true);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No accounts found.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <PlaidLink
          userId={userId}
          onSuccess={onUpdate}
          buttonText="Connect Another Account"
        />
      </div>
      
      {/* Remove Account Confirmation Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Account"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsRemoveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemove}
            >
              Remove Account
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to remove your account from{' '}
            <strong>{selectedAccount?.institution?.name || 'this financial institution'}</strong>?
          </p>
          
          <Card className="bg-yellow-50 border-yellow-100">
            <Card.Body>
              <div className="flex items-start">
                <div className="flex-shrink-0 text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>This will remove all account data from our system</li>
                      <li>Historical transactions will no longer be available</li>
                      <li>You can reconnect this account later if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

AccountList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      accessToken: PropTypes.string,
      itemId: PropTypes.string,
      status: PropTypes.string,
      mask: PropTypes.string,
      type: PropTypes.string,
      subtype: PropTypes.string,
      errorMessage: PropTypes.string,
      institution: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        logo: PropTypes.string,
      }),
    })
  ),
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default AccountList; 