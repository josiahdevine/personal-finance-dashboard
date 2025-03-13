import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import usePlaidLink from '../../../hooks/usePlaidLink';
import { PlaidLinkOnSuccessMetadata, PlaidLinkError, PlaidLinkOnEventMetadata } from 'react-plaid-link';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Alert } from '../../ui/Alert';

// Define the props interface for the PlaidLink component
export interface PlaidLinkProps {
  onSuccess?: (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  onExit?: (error: PlaidLinkError | null, metadata: PlaidLinkOnEventMetadata) => void;
  onEvent?: (eventName: string, metadata: PlaidLinkOnEventMetadata) => void;
  buttonText?: string;
  isButton?: boolean;
  className?: string;
  autoGenerateToken?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * PlaidLink Component - Used to connect bank accounts via Plaid
 * 
 * This component integrates with the Plaid Link API using the usePlaidLink hook.
 * 
 * @example
 * ```tsx
 * <PlaidLink 
 *   onSuccess={(publicToken, metadata) => console.log('Success!', publicToken)}
 *   buttonText="Connect Bank Account"
 * />
 * ```
 */
export const PlaidLink: React.FC<PlaidLinkProps> = ({
  onSuccess,
  onExit,
  onEvent,
  buttonText = 'Link Account',
  isButton = true,
  className = '',
  autoGenerateToken = false,
  variant = 'default',
  size = 'default',
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use our custom usePlaidLink hook
  const { ready, error, generateToken, open, isLoading } = usePlaidLink({
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
  const handleClick = useCallback(async () => {
    // If not ready (no token), generate one first
    if (!ready) {
      await generateToken();
      return;
    }
    
    // Open Plaid Link
    open();
  }, [ready, open, generateToken]);

  // Show loading spinner when generating token
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    const errorMessage = 'message' in error ? error.message : 'An error occurred';
    return (
      <Alert 
        variant="error" 
        title="Error" 
        message={errorMessage}
      />
    );
  }

  // Render a button if isButton is true
  if (isButton) {
    return (
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className={className}
        variant={variant}
        size={size}
      >
        {!ready ? 'Connecting...' : buttonText}
      </Button>
    );
  }

  // Otherwise render a div with appropriate accessibility attributes
  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      aria-disabled={!!error || isLoading}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {!ready ? 'Connecting...' : buttonText}
    </div>
  );
};

export default PlaidLink;