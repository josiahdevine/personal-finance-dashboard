import React, { useCallback, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, PlaidLinkOnEvent, PlaidLinkOnEventMetadata, PlaidLinkError, PlaidLinkOnExit, PlaidLinkOptions } from 'react-plaid-link';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import PlaidService from '../../../services/plaidService';
import Button from '../../common/button/Button';

// Add mocks for missing components
// These will be replaced when we implement the actual components
const Spinner = ({ size, className }: { size?: string, className?: string }) => (
  <div className={`spinner ${size || ''} ${className || ''}`}>Loading...</div>
);

const Alert = ({ 
  type, 
  message, 
  className,
  onClose
}: { 
  type: string, 
  message: string, 
  className?: string,
  onClose?: () => void 
}) => (
  <div className={`alert alert-${type} ${className || ''}`}>
    {message}
    {onClose && (
      <button onClick={onClose} className="alert-close-btn">×</button>
    )}
  </div>
);

export interface PlaidLinkProps {
  onSuccess?: (metadata: PlaidLinkOnSuccessMetadata) => void;
  onExit?: (error: PlaidLinkError | null, metadata: Record<string, unknown>) => void;
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'text' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  customButton?: React.ReactNode;
}

// Define the response type for createLinkToken
interface LinkTokenResponse {
  link_token: string;
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({
  onSuccess,
  onExit,
  buttonText = 'Connect Bank Account',
  className,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  customButton,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const { execute: createLinkToken, isLoading } = useAsyncAction(PlaidService.createLinkToken);
  const [token, setToken] = useState<string | null>(null);

  // Configure Plaid Link
  const config: PlaidLinkOptions = {
    token,
    receivedRedirectUri: window.location.href,
    onSuccess: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      if (!user) return;
      try {
        PlaidService.exchangePublicToken(public_token, user.id);
        setError(null);
        if (onSuccess) onSuccess(metadata);
      } catch (err) {
        console.error('Error exchanging public token:', err);
        setError('Failed to connect your bank account. Please try again.');
      }
    },
    onExit: (err?: PlaidLinkError | null, metadata?: any) => {
      if (err && err.error_code !== 'USER_CLOSED') {
        setError(`Connection error: ${err.display_message || err.error_message || 'Unknown error'}`);
      }
      if (onExit && metadata) onExit(err || null, metadata);
    },
    onEvent: (eventName: string, metadata: PlaidLinkOnEventMetadata) => {
      console.debug('Plaid Link event:', eventName, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleCreateLinkToken = useCallback(async () => {
    if (!user) return;
    try {
      const result = await createLinkToken([user.id]);
      if (result && typeof result === 'object' && 'link_token' in result) {
        const typedResult = result as LinkTokenResponse;
        setToken(typedResult.link_token || '');
        open();
      } else {
        throw new Error('Invalid token response');
      }
    } catch (err) {
      console.error('Error creating link token:', err);
      setError('Failed to initialize bank connection. Please try again later.');
    }
  }, [user, createLinkToken, open]);

  // If no user is authenticated, show login message
  if (!user) {
    return (
      <Alert 
        type="warning" 
        message="Please log in to connect your bank account."
        className={className}
      />
    );
  }

  // Show custom button if provided
  if (customButton) {
    return React.cloneElement(customButton as React.ReactElement, {
      onClick: handleCreateLinkToken,
      disabled: isLoading || !ready,
    });
  }

  return (
    <div className={className}>
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4"
          onClose={() => setError(null)}
        />
      )}
      
      <Button
        onClick={handleCreateLinkToken}
        isDisabled={isLoading || !ready}
        variant={variant}
        size={size}
        isFullWidth={isFullWidth}
        className={typeof theme === 'string' && theme === 'dark' ? 'plaid-button-dark' : 'plaid-button-light'}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Spinner size="small" className="mr-2" />
            Connecting...
          </span>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
}; 