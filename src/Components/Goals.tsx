import React from 'react';
import FinancialGoals from './goals/FinancialGoals';

const Goals: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Goals</h1>
      <FinancialGoals />
    </div>
  );
};

export default Goals; 