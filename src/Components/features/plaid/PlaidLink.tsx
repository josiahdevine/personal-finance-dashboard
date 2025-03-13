import React, { useEffect, useState } from 'react';
import Button from '../../common/button';
import usePlaidLink from '../../../hooks/usePlaidLink';
import { PlaidLinkOnSuccessMetadata, PlaidLinkError, PlaidLinkOnEventMetadata } from 'react-plaid-link';

// Define the props interface for the PlaidLink component
export interface PlaidLinkProps {
  onSuccess?: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  onExit?: (error: PlaidLinkError | null, metadata: PlaidLinkOnEventMetadata) => void;
  onEvent?: (eventName: string, metadata: PlaidLinkOnEventMetadata) => void;
  buttonText?: string;
  isButton?: boolean;
  className?: string;
  autoGenerateToken?: boolean;
}

/**
 * PlaidLink Component - Used to connect bank accounts via Plaid
 * 
 * This component integrates with the Plaid Link API using the usePlaidLink hook.
 */
export const PlaidLink: React.FC<PlaidLinkProps> = ({
  onSuccess,
  onExit,
  onEvent,
  buttonText = 'Link Account',
  isButton = true,
  className = '',
  autoGenerateToken = false,
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use our custom usePlaidLink hook
  const { ready, error, generateToken, open } = usePlaidLink({
    onSuccess,
    onExit,
    onEvent,
  });

  // Auto-generate token if requested
  useEffect(() => {
    if (autoGenerateToken && isInitialLoad) {
      generateToken();
      setIsInitialLoad(false);
    }
  }, [autoGenerateToken, generateToken, isInitialLoad]);

  // Handle click on the button/link
  const handleClick = async () => {
    // If not ready (no token), generate one first
    if (!ready) {
      await generateToken();
      return;
    }
    
    // Open Plaid Link
    open();
  };

  // Render a button if isButton is true
  if (isButton) {
    return (
      <Button
        onClick={handleClick}
        isDisabled={!!error}
        className={className}
        variant="primary"
      >
        {!ready ? 'Connecting...' : buttonText}
      </Button>
    );
  }

  // Otherwise render a div
  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      aria-disabled={!!error}
    >
      {buttonText}
    </div>
  );
};

export default PlaidLink;