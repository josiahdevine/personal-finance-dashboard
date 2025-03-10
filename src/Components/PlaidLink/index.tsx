import React, { useEffect, useState } from 'react';

/**
 * @deprecated This component is deprecated. Please use the version from 
 * src/components/features/plaid/PlaidLink.tsx instead.
 * 
 * This will be removed in a future release.
 */
export const PlaidLinkButton: React.FC<any> = (props) => {
  console.warn('Using deprecated PlaidLinkButton component. Please import from src/components/features/plaid/PlaidLink.tsx instead.');
  
  // Use state to hold the dynamically imported component
  const [CorrectComponent, setCorrectComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import the correct component
    import('../features/plaid/PlaidLink')
      .then(module => {
        setCorrectComponent(() => module.PlaidLink);
      })
      .catch(error => {
        console.error('Error importing PlaidLink:', error);
      });
  }, []);

  if (!CorrectComponent) {
    // Return loading state or fallback while importing
    return <div>Loading Plaid Component...</div>;
  }

  return <CorrectComponent {...props} />;
};