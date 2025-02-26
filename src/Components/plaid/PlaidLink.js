import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { usePlaidLink } from 'react-plaid-link';
import { Button, Card, Modal, Badge } from '../ui';
import plaidService from '../../services/plaidService';

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
  
  // Fetch institution details if institutionId is provided
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId) return;
      
      try {
        setIsLoading(true);
        const institutionData = await plaidService.getInstitution(institutionId);
        setInstitution(institutionData);
      } catch (error) {
        console.error('Error fetching institution:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstitution();
  }, [institutionId]);
  
  // Create a link token when the component mounts
  useEffect(() => {
    const createToken = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let token;
        
        if (isUpdateMode && accessToken) {
          token = await plaidService.createUpdateLinkToken(userId, accessToken);
        } else {
          token = await plaidService.createLinkToken({ userId });
        }
        
        setLinkToken(token);
      } catch (err) {
        console.error('Error creating link token:', err);
        setError({
          message: 'Failed to initialize bank connection. Please try again later.',
          details: err.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    createToken();
  }, [userId, isUpdateMode, accessToken]);
  
  // Handle successful connection
  const handleSuccess = useCallback(async (publicToken, metadata) => {
    setIsLoading(true);
    
    try {
      const exchangeResult = await plaidService.exchangePublicToken(publicToken, metadata);
      
      if (onSuccess) {
        onSuccess(exchangeResult, metadata);
      }
    } catch (err) {
      console.error('Error exchanging public token:', err);
      setError({
        message: 'Failed to complete account connection. Please try again.',
        details: err.message
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);
  
  // Handle exit from Plaid Link
  const handleExit = useCallback((err, metadata) => {
    // If there was an error, show it in the error modal
    if (err != null) {
      let errorMessage = 'An unknown error occurred while connecting your account.';
      
      if (err.error_code) {
        errorMessage = plaidService.getErrorMessage(err.error_code);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError({
        message: errorMessage,
        details: JSON.stringify(err),
        metadata
      });
      
      setIsModalOpen(true);
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
  };
  
  const { open, ready } = usePlaidLink(config);
  
  // Render appropriate button based on state
  const renderButton = () => {
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
        onClick={() => open()}
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
      
      {/* Error Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connection Issue"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              // Retry the connection after a short delay
              setTimeout(() => {
                if (ready && linkToken) {
                  open();
                }
              }, 500);
            }}>
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
          
          {error?.details && process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-gray-500 mt-4">
              <summary>Technical Details (Development Only)</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                {error.details}
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