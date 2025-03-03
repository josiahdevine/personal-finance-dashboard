import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { usePlaidLink } from '../../contexts/PlaidLinkContext';
import { Button, Card, Modal, Badge } from '../ui';
import plaidService from '../../services/plaidService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { log, logError } from '../../utils/logger';

/**
 * PlaidLink component for connecting bank accounts
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID to associate with the account
 * @param {Function} props.onSuccess - Called after successful account connection
 * @param {Function} [props.onExit] - Called when Plaid Link is closed without connecting
 * @param {string} [props.buttonText='Connect Bank Account'] - Text for the connect button
 * @param {string} [props.buttonVariant='primary'] - Button variant
 * @param {boolean} [props.isUpdateMode=false] - Whether to use update mode to fix a connection
 * @param {string} [props.accessToken] - Access token for update mode
 * @param {string} [props.itemId] - Item ID for update mode
 * @param {string} [props.institutionId] - Institution ID for more specific UI
 * @returns {JSX.Element} PlaidLink component
 */
const PlaidLink = ({
  userId,
  onSuccess,
  onExit,
  buttonText = 'Connect Bank Account',
  buttonVariant = 'primary',
  isUpdateMode = false,
  accessToken,
  itemId,
  institutionId,
  ...props
}) => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [tokenCreationAttempts, setTokenCreationAttempts] = useState(0);
  const { isAuthenticated, currentUser } = useAuth();
  
  const MAX_RETRY_ATTEMPTS = 3;
  
  // Log component initialization
  log('PlaidLink', 'Component initialized', { 
    userId, 
    isUpdateMode, 
    hasAccessToken: !!accessToken, 
    hasItemId: !!itemId,
    hasInstitutionId: !!institutionId,
    isAuthenticated
  });
  
  // Verify authentication status
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      log('PlaidLink', 'User not authenticated', { isAuthenticated });
      setError({
        message: 'Authentication required to connect your bank account.',
        details: 'Please log in to continue.',
        code: 'auth_required'
      });
    } else if (currentUser.uid !== userId) {
      logError('PlaidLink', 'User ID mismatch', new Error('User ID doesn\'t match current user'), {
        currentUserUid: currentUser.uid,
        providedUserId: userId
      });
      setError({
        message: 'Authentication issue detected.',
        details: 'User identity verification failed. Please refresh the page and try again.',
        code: 'user_mismatch'
      });
    }
  }, [isAuthenticated, currentUser, userId]);
  
  // Check for online connectivity
  useEffect(() => {
    const handleOnlineStatus = () => {
      log('PlaidLink', 'Online status changed', { isOnline: navigator.onLine });
      
      if (!navigator.onLine) {
        setError({
          message: 'Internet connection required.',
          details: 'Please check your connection and try again.',
          code: 'offline'
        });
      } else if (error?.code === 'offline') {
        // Clear offline error if we're back online
        setError(null);
        // Retry token creation if we're back online and had an offline error
        if (tokenCreationAttempts < MAX_RETRY_ATTEMPTS) {
          createLinkToken();
        }
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    handleOnlineStatus();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [error?.code, tokenCreationAttempts]);
  
  // Fetch institution details if institutionId is provided
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId) return;
      
      try {
        setIsLoading(true);
        log('PlaidLink', 'Fetching institution details', { institutionId });
        const institutionData = await plaidService.getInstitution(institutionId);
        setInstitution(institutionData);
        log('PlaidLink', 'Institution details fetched successfully', { 
          name: institutionData.name,
          institutionId: institutionData.institution_id
        });
      } catch (error) {
        logError('PlaidLink', 'Error fetching institution', error, { institutionId });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstitution();
  }, [institutionId]);
  
  // Function to create link token with retry logic
  const createLinkToken = useCallback(async () => {
    // Skip if not authenticated
    if (!isAuthenticated || !currentUser) {
      log('PlaidLink', 'Skipping token creation - user not authenticated');
      return;
    }
    
    // Skip if offline
    if (!navigator.onLine) {
      log('PlaidLink', 'Skipping token creation - offline');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      log('PlaidLink', 'Creating link token', { 
        attempt: tokenCreationAttempts + 1,
        isUpdateMode, 
        hasAccessToken: !!accessToken 
      });
      
      setTokenCreationAttempts(prev => prev + 1);
      
      let token;
      
      if (isUpdateMode && accessToken) {
        token = await plaidService.createUpdateLinkToken(userId, accessToken);
      } else {
        token = await plaidService.createLinkToken({ 
          userId,
          clientName: 'Personal Finance Dashboard',
          products: ['auth', 'transactions'],
          countryCodes: ['US'],
          language: 'en'
        });
      }
      
      if (!token) {
        throw new Error('No link token returned from server');
      }
      
      log('PlaidLink', 'Link token created successfully', { hasToken: !!token });
      setLinkToken(token);
    } catch (err) {
      logError('PlaidLink', 'Error creating link token', err, { 
        userId, 
        isUpdateMode, 
        attempt: tokenCreationAttempts 
      });
      
      let errorMessage = 'Failed to initialize bank connection. Please try again later.';
      let errorCode = 'link_token_creation_failed';
      
      if (err.message?.includes('network') || err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorCode = 'network_error';
      } else if (err.message?.includes('authentication') || err.code?.includes('auth')) {
        errorMessage = 'Authentication error. Please log in and try again.';
        errorCode = 'auth_error';
      }
      
      setError({
        message: errorMessage,
        details: err.message,
        code: errorCode
      });
      
      // Retry logic for specific errors
      if (['network_error', 'timeout'].includes(errorCode) && 
          tokenCreationAttempts < MAX_RETRY_ATTEMPTS) {
        const retryDelay = Math.min(2000 * (2 ** tokenCreationAttempts), 10000);
        log('PlaidLink', `Scheduling retry in ${retryDelay}ms`, { attempt: tokenCreationAttempts });
        
        setTimeout(() => {
          if (navigator.onLine && isAuthenticated) {
            log('PlaidLink', 'Attempting to retry token creation');
            createLinkToken();
          }
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isUpdateMode, accessToken, tokenCreationAttempts, isAuthenticated, currentUser]);
  
  // Create a link token when the component mounts or when auth state changes
  useEffect(() => {
    createLinkToken();
  }, [createLinkToken]);
  
  // Handle successful connection with better error handling
  const handleSuccess = useCallback(async (publicToken, metadata) => {
    if (!publicToken) {
      logError('PlaidLink', 'No public token received', new Error('Public token missing'));
      setError({
        message: 'Failed to complete account connection due to a technical issue.',
        details: 'No public token received from Plaid',
        code: 'missing_public_token'
      });
      setIsModalOpen(true);
      return;
    }
    
    log('PlaidLink', 'Received public token from Plaid', { 
      hasPublicToken: !!publicToken,
      hasMetadata: !!metadata,
      institution: metadata?.institution?.name
    });
    
    setIsLoading(true);
    
    try {
      log('PlaidLink', 'Exchanging public token');
      const exchangeResult = await plaidService.exchangePublicToken(publicToken, metadata);
      log('PlaidLink', 'Public token exchanged successfully', { 
        hasAccessToken: !!exchangeResult.accessToken,
        hasItemId: !!exchangeResult.itemId
      });
      
      if (onSuccess) {
        onSuccess(exchangeResult, metadata);
      }
      
      // Show success toast
      toast.success(
        metadata?.institution?.name 
          ? `Successfully connected to ${metadata.institution.name}` 
          : 'Successfully connected your account'
      );
    } catch (err) {
      logError('PlaidLink', 'Error exchanging public token', err);
      
      let errorMessage = 'Failed to complete account connection. Please try again.';
      if (err.message?.includes('network')) {
        errorMessage = 'Network error while connecting your account. Your bank connection may still have been successful. Please check your accounts page.';
      }
      
      setError({
        message: errorMessage,
        details: err.message,
        code: 'token_exchange_failed'
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);
  
  // Handle exit from Plaid Link with enhanced logging
  const handleExit = useCallback((err, metadata) => {
    log('PlaidLink', 'Plaid Link exit', { 
      hasError: !!err, 
      errorCode: err?.error_code,
      errorType: err?.error_type,
      hasMetadata: !!metadata,
      linkSessionId: metadata?.link_session_id
    });
    
    // If there was an error, show it in the error modal
    if (err != null) {
      let errorMessage = 'An unknown error occurred while connecting your account.';
      let errorCode = err.error_code || 'unknown_error';
      
      if (err.error_code) {
        errorMessage = plaidService.getErrorMessage(err.error_code);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      logError('PlaidLink', 'Plaid Link exit with error', err, { metadata });
      
      setError({
        message: errorMessage,
        details: JSON.stringify(err),
        metadata,
        code: errorCode
      });
      
      setIsModalOpen(true);
    } else if (metadata?.status === 'exit') {
      // User exited without error and without completing
      log('PlaidLink', 'User exited Plaid Link flow', { 
        exitStatus: metadata?.status,
        institution: metadata?.institution?.name 
      });
    }
    
    if (onExit) {
      onExit(err, metadata);
    }
  }, [onExit]);
  
  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: (publicToken, metadata) => handleSuccess(publicToken, metadata),
    onExit: (err, metadata) => handleExit(err, metadata),
    // Add optional configurations for better user experience
    receivedRedirectUri: window.location.href,
    env: process.env.REACT_APP_PLAID_ENV || 'sandbox',
  };
  
  const { open, ready } = usePlaidLink(config);
  
  // Render appropriate button based on state
  const renderButton = () => {
    // If authentication is required
    if (!isAuthenticated) {
      return (
        <Button 
          variant="outline" 
          isDisabled={true}
          {...props}
        >
          Log in to Connect Account
        </Button>
      );
    }
    
    // If offline
    if (!navigator.onLine) {
      return (
        <Button 
          variant="outline" 
          isDisabled={true}
          {...props}
        >
          Connection Unavailable
        </Button>
      );
    }
    
    if (isLoading) {
      return (
        <Button 
          variant={buttonVariant} 
          isLoading={true}
          isDisabled={true}
          {...props}
        >
          {isUpdateMode ? 'Preparing to Update...' : 'Preparing Connection...'}
        </Button>
      );
    }
    
    if (error && !isModalOpen) {
      return (
        <Button 
          variant="destructive" 
          onClick={() => setIsModalOpen(true)}
          {...props}
        >
          Connection Failed
        </Button>
      );
    }
    
    return (
      <Button 
        variant={buttonVariant} 
        onClick={() => {
          log('PlaidLink', 'Open button clicked', { ready, hasLinkToken: !!linkToken });
          if (ready && linkToken) {
            open();
          } else if (!linkToken && tokenCreationAttempts < MAX_RETRY_ATTEMPTS) {
            // Try to create token again if button is clicked but we don't have a token
            toast.info('Preparing connection...');
            createLinkToken();
          }
        }}
        isDisabled={!ready || !linkToken}
        {...props}
      >
        {buttonText}
      </Button>
    );
  };
  
  return (
    <>
      {renderButton()}
      
      {/* Error Modal with improved error handling */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connection Issue"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsModalOpen(false);
                // Retry the connection after a short delay
                setTimeout(() => {
                  if (error?.code === 'token_exchange_failed') {
                    // For token exchange errors, create a new link token
                    createLinkToken();
                  } else if (ready && linkToken) {
                    // For Plaid Link errors, reopen the existing link
                    open();
                  } else {
                    // Fall back to creating a new token
                    createLinkToken();
                  }
                }, 500);
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
              <p className="font-medium">{error?.message || 'An error occurred connecting to your financial institution.'}</p>
              {institution && (
                <p className="text-sm text-gray-600 mt-1">
                  While connecting to {institution.name}
                </p>
              )}
              {error?.metadata?.institution?.name && !institution && (
                <p className="text-sm text-gray-600 mt-1">
                  While connecting to {error.metadata.institution.name}
                </p>
              )}
            </div>
          </div>
          
          <Card className="bg-gray-50 border-gray-200">
            <Card.Body>
              <h3 className="text-sm font-medium mb-2">What can you do?</h3>
              <ul className="text-sm space-y-2">
                <li>• Check your internet connection and try again</li>
                <li>• Verify your login credentials for your financial institution</li>
                <li>• Try again in a few minutes as the bank might be temporarily unavailable</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </Card.Body>
          </Card>
          
          {error?.details && (process.env.NODE_ENV === 'development' || error?.code === 'token_exchange_failed') && (
            <details className="text-xs text-gray-500 mt-4">
              <summary>Technical Details {process.env.NODE_ENV !== 'development' && '(Error Code)'}</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                {process.env.NODE_ENV === 'development' ? error.details : error.code}
              </pre>
            </details>
          )}
        </div>
      </Modal>
    </>
  );
};

PlaidLink.propTypes = {
  userId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onExit: PropTypes.func,
  buttonText: PropTypes.string,
  buttonVariant: PropTypes.string,
  isUpdateMode: PropTypes.bool,
  accessToken: PropTypes.string,
  itemId: PropTypes.string,
  institutionId: PropTypes.string,
};

export default PlaidLink; 