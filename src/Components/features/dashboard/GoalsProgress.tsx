import React from 'react';
import { Card } from '../../common/Card';
import { useGoals } from '../../../hooks/useGoals';
import { formatCurrency } from '../../../utils/formatters';

export const GoalsProgress: React.FC = () => {
  const { goals, loading } = useGoals();

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Financial Goals</h2>
          <a href="/goals" className="text-blue-600 hover:text-blue-700 text-sm">
            View All Goals
          </a>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = Math.ceil(
                (new Date(goal.targetDate).getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24)
              );

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-gray-600">
                      {daysLeft} days left
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <p className="text-center text-gray-500">
                No active goals
              </p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 