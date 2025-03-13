import React, { useCallback, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccessMetadata, PlaidLinkError, PlaidLinkOnEventMetadata, PlaidLinkOptions } from 'react-plaid-link';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import PlaidService from '../../../lower-components/plaidService';
import Button from '../../common/button/Button';
import { Alert } from '../../ui/Alert';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

export interface PlaidLinkProps {
  onSuccess?: () => void;
  onExit?: () => void;
  buttonText?: string;
  isButton?: boolean;
  className?: string;
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({
  onSuccess,
  onExit,
  buttonText = 'Link Account',
  isButton = true,
  className = '',
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  const { execute: createLinkToken, isLoading } = useAsyncAction(async () => {
    try {
      setError(null);
      const result = await PlaidService.createLinkToken();
      setToken(result.link_token);
      return result;
    } catch (err) {
      setError('Failed to create link token. Please try again later.');
      throw err;
    }
  });

  const onPlaidSuccess = useCallback(
    async (publicToken: string, _metadata: PlaidLinkOnSuccessMetadata) => {
      try {
        setError(null);
        await PlaidService.exchangePublicToken(publicToken, 'current-user');
        onSuccess?.();
      } catch (err) {
        setError('Failed to link account. Please try again later.');
        console.error('Plaid link error:', err);
      }
    },
    [onSuccess]
  );

  const onPlaidExit = useCallback(
    (err: null | PlaidLinkError, metadata: PlaidLinkOnEventMetadata) => {
      if (err) {
        console.error('Plaid link exit error:', err);
      }
      onExit?.();
    },
    [onExit]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess: (public_token, metadata) => {
      onPlaidSuccess(public_token, metadata);
    },
    onExit,
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', eventName, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = useCallback(() => {
    if (!token) {
      createLinkToken().then(() => {
        if (ready) open();
      });
    } else if (ready) {
      open();
    }
  }, [ready, open, token, createLinkToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Error">
        {error}
      </Alert>
    );
  }

  if (isButton) {
    return (
      <Button
        onClick={handleClick}
        isDisabled={isLoading}
        className={className}
        variant="primary"
      >
        {buttonText}
      </Button>
    );
  }

  return (
    <div onClick={handleClick} className={`cursor-pointer ${className}`}>
      {buttonText}
    </div>
  );
};

export default PlaidLink; 