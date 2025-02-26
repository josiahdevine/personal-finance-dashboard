import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Badge, Modal } from '../ui';
import plaidService from '../../services/plaidService';

/**
 * TransactionSync component for syncing and displaying transaction data
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID for transactions
 * @param {Array<string>} [props.accountIds] - Account IDs to filter transactions
 * @param {Function} [props.onSyncComplete] - Called when sync completes successfully
 * @param {Function} [props.onError] - Called when a sync error occurs
 * @returns {JSX.Element} TransactionSync component
 */
const TransactionSync = ({ 
  userId,
  accountIds = [],
  onSyncComplete,
  onError,
}) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStats, setSyncStats] = useState({
    added: 0,
    modified: 0,
    removed: 0,
    hasMore: false,
  });
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };
  
  // Sync transactions
  const syncTransactions = useCallback(async (cursor = null) => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setSyncError(null);
    
    try {
      const result = await plaidService.syncTransactions(userId, cursor);
      
      // Accumulate stats if we had previous stats and this is a continuation
      if (cursor && syncStats) {
        setSyncStats(prev => ({
          added: prev.added + (result.added?.length || 0),
          modified: prev.modified + (result.modified?.length || 0),
          removed: prev.removed + (result.removed?.length || 0),
          hasMore: result.hasMore,
        }));
      } else {
        setSyncStats({
          added: result.added?.length || 0,
          modified: result.modified?.length || 0,
          removed: result.removed?.length || 0,
          hasMore: result.hasMore,
        });
      }
      
      // If there are more transactions to sync, continue syncing
      if (result.hasMore && result.nextCursor) {
        await syncTransactions(result.nextCursor);
      } else {
        // Sync complete
        setSyncStatus('success');
        setLastSyncTime(new Date().toISOString());
        
        if (onSyncComplete) {
          onSyncComplete(result);
        }
      }
    } catch (error) {
      console.error('Transaction sync error:', error);
      setSyncStatus('error');
      setSyncError(error);
      setIsErrorModalOpen(true);
      
      if (onError) {
        onError(error);
      }
    }
  }, [userId, onSyncComplete, onError, syncStatus, syncStats]);
  
  // Initial sync on mount
  useEffect(() => {
    // Check localStorage for last sync time
    const storedLastSyncTime = localStorage.getItem(`lastSyncTime_${userId}`);
    if (storedLastSyncTime) {
      setLastSyncTime(storedLastSyncTime);
    }
    
    // Don't run initial sync automatically
    // syncTransactions();
  }, [userId, syncTransactions]);
  
  // Save last sync time to localStorage when it changes
  useEffect(() => {
    if (lastSyncTime) {
      localStorage.setItem(`lastSyncTime_${userId}`, lastSyncTime);
    }
  }, [userId, lastSyncTime]);
  
  // Render sync status badge
  const renderStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Badge variant="warning" withDot>Syncing</Badge>;
      case 'success':
        return <Badge variant="success" withDot>Synced</Badge>;
      case 'error':
        return <Badge variant="danger" withDot>Error</Badge>;
      default:
        return lastSyncTime ? 
          <Badge variant="primary">Last synced: {formatTimestamp(lastSyncTime)}</Badge> : 
          <Badge variant="default">Never synced</Badge>;
    }
  };
  
  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Transactions</h2>
            {renderStatusBadge()}
          </div>
        </Card.Header>
        
        <Card.Body>
          <div className="space-y-4">
            {syncStatus === 'success' && syncStats && (
              <div className="bg-green-50 border border-green-100 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Sync Completed</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Successfully synced your transactions:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>{syncStats.added} new transactions added</li>
                        <li>{syncStats.modified} transactions updated</li>
                        <li>{syncStats.removed} transactions removed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  {lastSyncTime ? (
                    <>Last synced: <span className="font-medium">{formatTimestamp(lastSyncTime)}</span></>
                  ) : (
                    'Transactions have not been synced yet.'
                  )}
                </p>
                {accountIds.length > 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    Filtering for {accountIds.length} selected account{accountIds.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <Button
                onClick={() => syncTransactions()}
                isLoading={syncStatus === 'syncing'}
                isDisabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Transactions'}
              </Button>
            </div>
            
            {syncStatus === 'error' && !isErrorModalOpen && (
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Sync failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{syncError?.message || 'An error occurred while syncing transactions.'}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setIsErrorModalOpen(true)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
      
      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Sync Error Details"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsErrorModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsErrorModalOpen(false);
                syncTransactions();
              }}
            >
              Try Again
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start">
            <Badge variant="danger" withDot className="mt-1 mr-2">Error</Badge>
            <div>
              <p className="font-medium">{syncError?.message || 'An error occurred while syncing transactions.'}</p>
              <p className="text-sm text-gray-600 mt-1">
                Error Code: {syncError?.code || 'Unknown'}
              </p>
            </div>
          </div>
          
          <Card className="bg-gray-50 border-gray-200">
            <Card.Body>
              <h3 className="text-sm font-medium mb-2">Troubleshooting Steps</h3>
              <ul className="text-sm space-y-2">
                <li>• Check your internet connection</li>
                <li>• Verify that your bank accounts are properly connected</li>
                <li>• If accounts were recently connected, wait a few minutes and try again</li>
                <li>• If the error persists, reconnect your bank accounts</li>
              </ul>
            </Card.Body>
          </Card>
          
          {syncError?.plaidError && process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-gray-500 mt-4">
              <summary>Technical Details (Development Only)</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                {JSON.stringify(syncError.plaidError, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Modal>
    </>
  );
};

TransactionSync.propTypes = {
  userId: PropTypes.string.isRequired,
  accountIds: PropTypes.arrayOf(PropTypes.string),
  onSyncComplete: PropTypes.func,
  onError: PropTypes.func,
};

export default TransactionSync; 