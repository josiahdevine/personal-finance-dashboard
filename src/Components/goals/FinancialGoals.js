import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/liveApi';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ProgressBar from '../ui/ProgressBar.tsx';
import { currencyFormatter } from '../../utils/formatters';
import { log, logError } from '../../utils/logger';
import LoadingSpinner from '../ui/LoadingSpinner';

const FinancialGoals = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/goals');
      setGoals(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals');
      logError('FinancialGoals', 'Error fetching goals', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchGoals();
    }
  }, [currentUser, fetchGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/api/goals', newGoal);
      toast.success('Goal added successfully');
      setNewGoal({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: ''
      });
      fetchGoals();
    } catch (err) {
      toast.error('Failed to add goal');
      logError('FinancialGoals', 'Error adding goal', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiService.delete(`/api/goals/${goalId}`);
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete goal');
      logError('FinancialGoals', 'Error deleting goal', err);
    }
  };

  const handleUpdateProgress = async (goalId, amount) => {
    try {
      await apiService.patch(`/api/goals/${goalId}/progress`, { amount });
      toast.success('Progress updated successfully');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to update progress');
      logError('FinancialGoals', 'Error updating goal progress', err);
    }
  };

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const aProgress = (a.currentAmount / a.targetAmount) * 100;
      const bProgress = (b.currentAmount / b.targetAmount) * 100;
      return bProgress - aProgress;
    });
  }, [goals]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchGoals} onKeyDown={fetchGoals} role="button" tabIndex={0}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddGoal} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.targetAmount}
            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            placeholder="Current Amount"
            value={newGoal.currentAmount}
            onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            className="border rounded p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Goal
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGoals.map((goal) => (
          <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{goal.name}</h3>
              <button
                onClick={() => handleDeleteGoal(goal.id)} onKeyDown={() => handleDeleteGoal(goal.id)} role="button" tabIndex={0}
                className="text-red-500 hover:text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="font-medium">{currencyFormatter.format(goal.targetAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current</p>
                <p className="font-medium">{currencyFormatter.format(goal.currentAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</p>
              </div>
              <ProgressBar
                progress={(goal.currentAmount / goal.targetAmount) * 100}
                label={`${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => handleUpdateProgress(goal.id, -100)} onKeyDown={() => handleUpdateProgress(goal.id, -100)} role="button" tabIndex={0}
                  className="text-red-500 hover:text-red-600"
                >
                  <ArrowDownCircleIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={() => handleUpdateProgress(goal.id, 100)} onKeyDown={() => handleUpdateProgress(goal.id, 100)} role="button" tabIndex={0}
                  className="text-green-500 hover:text-green-600"
                >
                  <ArrowUpCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialGoals; 