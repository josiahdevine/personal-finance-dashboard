import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/liveApi';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ProgressBar from './ui/ProgressBar';
import { currencyFormatter } from '../utils/formatters';
import { log, logError } from '../utils/logger';
import LoadingSpinner from './ui/LoadingSpinner';

// Number of goals to display per page
const GOALS_PER_PAGE = 5;

export default function FinancialGoals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'savings'
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch financial goals from API
  const fetchGoals = useCallback(async () => {
    if (!currentUser) {
      setGoals([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      log('FinancialGoals', 'Fetching goals');
      const fetchedGoals = await apiService.getFinancialGoals();
      
      if (Array.isArray(fetchedGoals)) {
        setGoals(fetchedGoals);
        log('FinancialGoals', `Retrieved ${fetchedGoals.length} goals`);
      } else {
        throw new Error('Invalid response format from goals API');
      }
    } catch (err) {
      logError('FinancialGoals', 'Error fetching goals:', err);
      setError('Failed to load your financial goals. Please try again later.');
      toast.error('Failed to load your financial goals');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial data fetch
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Memoized sorted and paginated goals
  const sortedGoals = useMemo(() => {
    if (!goals.length) return [];
    
    return [...goals].sort((a, b) => {
      // Handle different field types
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'target_amount' || sortField === 'current_amount') {
        return sortDirection === 'asc'
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else if (sortField === 'target_date') {
        const dateA = new Date(a.target_date);
        const dateB = new Date(b.target_date);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'progress') {
        const progressA = (a.current_amount / a.target_amount) * 100;
        const progressB = (b.current_amount / b.target_amount) * 100;
        return sortDirection === 'asc' ? progressA - progressB : progressB - progressA;
      } else {
        // Default for created_at, updated_at, etc.
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [goals, sortField, sortDirection]);

  // Pagination
  const paginatedGoals = useMemo(() => {
    const startIndex = (currentPage - 1) * GOALS_PER_PAGE;
    return sortedGoals.slice(startIndex, startIndex + GOALS_PER_PAGE);
  }, [sortedGoals, currentPage]);

  const totalPages = useMemo(() => 
    Math.ceil(sortedGoals.length / GOALS_PER_PAGE), 
    [sortedGoals]
  );

  // Handle input changes for new/editing goal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For amount fields, validate as numbers
    if (name === 'target_amount' || name === 'current_amount') {
      // Allow empty string or valid number
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setNewGoal(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setNewGoal(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit new goal or update existing
  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to add or edit goals');
      return;
    }
    
    if (!newGoal.name || !newGoal.target_amount) {
      toast.error('Goal name and target amount are required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the goal data
      const goalData = {
        ...newGoal,
        target_amount: Number(newGoal.target_amount),
        current_amount: newGoal.current_amount === '' ? 0 : Number(newGoal.current_amount)
      };
      
      if (editingGoalId) {
        // Update existing goal
        log('FinancialGoals', 'Updating goal', { goalId: editingGoalId });
        await apiService.updateFinancialGoal(editingGoalId, goalData);
        toast.success('Goal updated successfully');
      } else {
        // Create new goal
        log('FinancialGoals', 'Creating new goal');
        await apiService.createFinancialGoal(goalData);
        toast.success('Goal added successfully');
      }
      
      // Reset form and refresh goals
      setNewGoal({
        name: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
        category: 'savings'
      });
      setIsAddingGoal(false);
      setEditingGoalId(null);
      fetchGoals();
    } catch (err) {
      logError('FinancialGoals', 'Error saving goal:', err);
      toast.error(editingGoalId ? 'Failed to update goal' : 'Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a goal
  const handleEditGoal = (goal) => {
    setNewGoal({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date || '',
      category: goal.category || 'savings'
    });
    setEditingGoalId(goal.id);
    setIsAddingGoal(true);
    
    // Scroll to the form on mobile
    if (isMobile) {
      document.getElementById('goalForm')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    // Replace built-in confirm with custom confirmation
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      log('FinancialGoals', 'Deleting goal', { goalId });
      await apiService.deleteFinancialGoal(goalId);
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (err) {
      logError('FinancialGoals', 'Error deleting goal:', err);
      toast.error('Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  // Update goal amount
  const handleUpdateAmount = async (goalId, newAmount, isIncrement) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedAmount = Math.max(0, isIncrement 
      ? goal.current_amount + Math.abs(newAmount || 10)
      : goal.current_amount - Math.abs(newAmount || 10));
    
    try {
      log('FinancialGoals', `${isIncrement ? 'Increasing' : 'Decreasing'} goal amount`, { 
        goalId, currentAmount: goal.current_amount, newAmount: updatedAmount 
      });
      
      await apiService.updateFinancialGoal(goalId, { current_amount: updatedAmount });
      
      // Update local state for immediate feedback
      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, current_amount: updatedAmount } : g
      ));
      
      toast.success(`Goal ${isIncrement ? 'increased' : 'decreased'} by ${currencyFormatter.format(Math.abs(newAmount || 10))}`);
    } catch (err) {
      logError('FinancialGoals', 'Error updating goal amount:', err);
      toast.error('Failed to update goal amount');
    }
  };

  // Cancel adding/editing
  const handleCancelEdit = () => {
    setNewGoal({
      name: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      category: 'savings'
    });
    setIsAddingGoal(false);
    setEditingGoalId(null);
  };

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading && !isAddingGoal && !goals.length) {
    return <div className="w-full flex justify-center p-8"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">
          Financial Goals
        </h2>
        
        {!isAddingGoal && (
          <button
            onClick={() => setIsAddingGoal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            <span>Add Goal</span>
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      
      {/* Goal Form */}
      {isAddingGoal && (
        <form onSubmit={handleSubmitGoal} id="goalForm" className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal Name*
              </label>
              <input
                type="text"
                name="name"
                value={newGoal.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Amount*
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="target_amount"
                value={newGoal.target_amount}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="current_amount"
                value={newGoal.current_amount}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                value={newGoal.target_date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={newGoal.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="savings">Savings</option>
                <option value="debt">Debt Repayment</option>
                <option value="retirement">Retirement</option>
                <option value="purchase">Major Purchase</option>
                <option value="emergency">Emergency Fund</option>
                <option value="travel">Travel</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingGoalId ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      )}
      
      {/* Goals List */}
      {goals.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any financial goals yet.</p>
          {!isAddingGoal && (
            <button
              onClick={() => setIsAddingGoal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              <span>Create Your First Goal</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Sorting and Filtering Controls */}
          <div className="mb-4 flex flex-col md:flex-row gap-2 items-start md:items-center">
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-600 dark:text-gray-300">Sort by:</label>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field);
                  setSortDirection(direction);
                }}
                className="p-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="target_amount-asc">Target Amount (Low-High)</option>
                <option value="target_amount-desc">Target Amount (High-Low)</option>
                <option value="progress-asc">Progress (Low-High)</option>
                <option value="progress-desc">Progress (High-Low)</option>
                <option value="target_date-asc">Target Date (Earliest)</option>
                <option value="target_date-desc">Target Date (Latest)</option>
                <option value="created_at-desc">Recently Added</option>
                <option value="created_at-asc">Oldest Added</option>
              </select>
            </div>
          </div>
          
          {/* Goals Table/Cards */}
          {isMobile ? (
            // Mobile card view
            <div className="space-y-4">
              {paginatedGoals.map(goal => (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{goal.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit goal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Delete goal"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress: {((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%
                      </span>
                      <span className="font-medium">
                        {currencyFormatter.format(goal.current_amount)} / {currencyFormatter.format(goal.target_amount)}
                      </span>
                    </div>
                    <ProgressBar 
                      value={goal.current_amount} 
                      max={goal.target_amount} 
                      color="blue"
                      height="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="ml-1 capitalize">{goal.category || 'N/A'}</span>
                    </div>
                    {goal.target_date && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Target:</span>
                        <span className="ml-1">{new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-between gap-2">
                    <button
                      onClick={() => handleUpdateAmount(goal.id, 10, false)}
                      disabled={goal.current_amount <= 0}
                      className={`flex-1 flex justify-center items-center p-2 rounded text-sm 
                        ${goal.current_amount <= 0 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      <ArrowDownCircleIcon className="h-4 w-4 mr-1" />
                      <span>Decrease</span>
                    </button>
                    <button
                      onClick={() => handleUpdateAmount(goal.id, 10, true)}
                      className="flex-1 flex justify-center items-center p-2 rounded bg-green-100 text-green-700 hover:bg-green-200 text-sm"
                    >
                      <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                      <span>Increase</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop table view
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center"
                      >
                        Name
                        {sortField === 'name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('target_amount')}
                        className="flex items-center"
                      >
                        Amount
                        {sortField === 'target_amount' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('progress')}
                        className="flex items-center"
                      >
                        Progress
                        {sortField === 'progress' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center"
                      >
                        Category
                        {sortField === 'category' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('target_date')}
                        className="flex items-center"
                      >
                        Target Date
                        {sortField === 'target_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedGoals.map(goal => (
                    <tr key={goal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{goal.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {currencyFormatter.format(goal.current_amount)} / {currencyFormatter.format(goal.target_amount)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between mb-1 text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              {((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <ProgressBar 
                            value={goal.current_amount} 
                            max={goal.target_amount} 
                            color="blue"
                            height="h-2"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {goal.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {goal.target_date 
                          ? new Date(goal.target_date).toLocaleDateString() 
                          : 'No date'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateAmount(goal.id, 10, false)}
                            disabled={goal.current_amount <= 0}
                            className={`p-1 rounded ${goal.current_amount <= 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900 hover:bg-red-100'}`}
                            title="Decrease by $10"
                          >
                            <ArrowDownCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateAmount(goal.id, 10, true)}
                            className="p-1 rounded text-green-600 hover:text-green-900 hover:bg-green-100"
                            title="Increase by $10"
                          >
                            <ArrowUpCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-1 rounded text-blue-600 hover:text-blue-900 hover:bg-blue-100"
                            title="Edit goal"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1 rounded text-red-600 hover:text-red-900 hover:bg-red-100"
                            title="Delete goal"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Prev
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 