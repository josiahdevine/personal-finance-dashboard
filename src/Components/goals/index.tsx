import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  monthlyContribution?: number;
}

const GoalsTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('/api/goals');
        const data = await response.json();
        setGoals(data);
      } catch (err) {
        setError('Failed to fetch goals');
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {totalProgress.toFixed(1)}%
              </div>
              <div className="mt-1 text-sm text-gray-500">
                ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })} of ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              ></div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Financial Goals</h2>
        </Card.Header>
        <Card.Body>
          <div className="divide-y divide-gray-200">
            {sortedGoals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={goal.id} className="py-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="text-gray-500"> / </span>
                        ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {daysRemaining} days remaining
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        goal.priority === 'high'
                          ? 'bg-red-500'
                          : goal.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <p className="py-4 text-gray-500 text-center">No goals set</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GoalsTracker; 