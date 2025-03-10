import React, { useEffect, useState } from 'react';

/**
 * @deprecated This component is deprecated. Please use the components from 
 * src/components/features/budget/ directory instead.
 * 
 * This will be removed in a future release.
 */
const BudgetPlanner: React.FC = () => {
  console.warn('Using deprecated BudgetPlanner component. Please use components from src/components/features/budget/ instead.');
  
  // Use state to hold the dynamically imported component
  const [BudgetDashboard, setBudgetDashboard] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import the correct component
    import('../features/budget/BudgetDashboard')
      .then(module => {
        setBudgetDashboard(() => module.BudgetDashboard);
      })
      .catch(error => {
        console.error('Error importing BudgetDashboard:', error);
      });
  }, []);

  if (!BudgetDashboard) {
    // Return loading state or fallback while importing
    return <div>Loading Budget Component...</div>;
  }

  return <BudgetDashboard />;
};

export default BudgetPlanner; 