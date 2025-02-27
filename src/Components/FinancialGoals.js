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

  // Add this for touch gesture support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipedGoalId, setSwipedGoalId] = useState(null);
  
  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;
  
  // Handle touch events for swipe detection
  const onTouchStart = (e, goalId) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null); // Reset end position
  };
  
  const onTouchMove = (e, goalId) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = (goalId) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Left swipe - show delete/edit options
      setSwipedGoalId(swipedGoalId === goalId ? null : goalId);
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (isRightSwipe) {
      // Right swipe - hide options
      setSwipedGoalId(null);
    }
    
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

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

  // Mobile Goal Card component
  const MobileGoalCard = ({ goal }) => {
    const progress = goal.target_amount > 0 
      ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) 
      : 0;
    
    const isExpanded = swipedGoalId === goal.id;
    
    const timeRemaining = () => {
      if (!goal.target_date) return null;
      
      const targetDate = new Date(goal.target_date);
      const today = new Date();
      const diffTime = targetDate - today;
      
      if (diffTime <= 0) return 'Past due';
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) return `${diffDays} days left`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} left`;
      }
      
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} left`;
    };
    
    const goalColor = () => {
      if (progress >= 100) return 'bg-green-100 border-green-300';
      if (timeRemaining() === 'Past due') return 'bg-red-50 border-red-200';
      return 'bg-white border-gray-200';
    };
    
    return (
      <div 
        className={`relative overflow-hidden transition-all duration-300 mb-4 rounded-xl shadow-sm border ${goalColor()}`}
        onTouchStart={(e) => onTouchStart(e, goal.id)}
        onTouchMove={(e) => onTouchMove(e, goal.id)}
        onTouchEnd={() => onTouchEnd(goal.id)}
      >
        {/* Card content */}
        <div className="p-4">
          {/* Goal name and category */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{goal.name}</h3>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </span>
            </div>
            
            {/* Progress indication circular indicator */}
            <div className="relative w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                {/* Background track */}
                <circle 
                  cx="18" cy="18" r="16" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="3" 
                />
                {/* Progress indicator */}
                {progress > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" 
                    fill="none" 
                    stroke={progress >= 100 ? '#22c55e' : '#3b82f6'} 
                    strokeWidth="3"
                    strokeDasharray={`${progress} 100`} 
                    strokeDashoffset="25"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                )}
                {/* Percentage text */}
                <text 
                  x="18" y="18" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-xs font-medium"
                  fill={progress >= 100 ? '#22c55e' : '#3b82f6'}
                >
                  {Math.round(progress)}%
                </text>
              </svg>
            </div>
          </div>
          
          {/* Amount progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress:</span>
              <span className="font-medium">{currencyFormatter.format(goal.current_amount)} / {currencyFormatter.format(goal.target_amount)}</span>
            </div>
            <ProgressBar 
              progress={progress}
              color={progress >= 100 ? 'bg-green-500' : 'bg-blue-500'} 
              height="h-2"
              className="rounded-full"
            />
          </div>
          
          {/* Due date */}
          {goal.target_date && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Due:</span>
              <div className="flex items-center">
                <span className="font-medium">
                  {new Date(goal.target_date).toLocaleDateString()}
                </span>
                {timeRemaining() && (
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    timeRemaining() === 'Past due' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {timeRemaining()}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Quick add/subtract buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handleUpdateAmount(goal.id, 10, false)}
              className="flex items-center justify-center rounded-full w-12 h-12 border border-red-200 text-red-500 active:bg-red-50 transition-colors"
            >
              <ArrowDownCircleIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Adjust:</span>
              <input
                type="number"
                className="w-20 p-2 border border-gray-200 rounded text-center"
                defaultValue="10"
                min="0"
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    e.target.dataset.value = val;
                  } else {
                    e.target.value = e.target.dataset.value || "10";
                  }
                }}
              />
            </div>
            <button
              onClick={() => handleUpdateAmount(goal.id, 10, true)}
              className="flex items-center justify-center rounded-full w-12 h-12 border border-green-200 text-green-500 active:bg-green-50 transition-colors"
            >
              <ArrowUpCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Action buttons row that slides in from the right */}
        <div 
          className={`absolute inset-y-0 right-0 flex items-center space-x-2 pr-2 transition-transform duration-300 ${
            isExpanded ? 'transform translate-x-0' : 'transform translate-x-full'
          }`}
          style={{ 
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.9) 20%, white)'
          }}
        >
          <button
            onClick={() => handleEditGoal(goal)}
            className="flex items-center justify-center rounded-full w-10 h-10 bg-blue-100 text-blue-600 active:bg-blue-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteGoal(goal.id)}
            className="flex items-center justify-center rounded-full w-10 h-10 bg-red-100 text-red-600 active:bg-red-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Enhanced mobile form with better UX
  const renderMobileForm = () => {
    return (
      <div id="goalForm" className="p-4 bg-white rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingGoalId ? 'Edit Goal' : 'New Goal'}
          </h2>
          {isAddingGoal && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmitGoal} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., New Car, Emergency Fund"
              value={newGoal.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  id="target_amount"
                  name="target_amount"
                  inputMode="decimal"
                  placeholder="5000"
                  value={newGoal.target_amount}
                  onChange={handleInputChange}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="current_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Current Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  id="current_amount"
                  name="current_amount"
                  inputMode="decimal"
                  placeholder="0"
                  value={newGoal.current_amount}
                  onChange={handleInputChange}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                id="target_date"
                name="target_date"
                value={newGoal.target_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={newGoal.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="savings">Savings</option>
                <option value="investment">Investment</option>
                <option value="debt">Debt Repayment</option>
                <option value="purchase">Major Purchase</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
                <option value="retirement">Retirement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                editingGoalId ? 'Update Goal' : 'Add Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading && !isAddingGoal && !goals.length) {
    return <div className="w-full flex justify-center p-8"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        {!isAddingGoal && (
          <button
            onClick={() => setIsAddingGoal(true)}
            className="flex items-center justify-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isMobile ? (
        // Mobile view
        <div>
          {isAddingGoal && renderMobileForm()}
          
          {loading && !isAddingGoal ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : paginatedGoals.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Swipe left on a goal to edit or delete
                </p>
                {paginatedGoals.map((goal) => (
                  <MobileGoalCard key={goal.id} goal={goal} />
                ))}
              </div>
              
              {/* Pagination for mobile */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 pt-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentPage === i + 1 
                          ? 'bg-blue-600 w-4' 
                          : 'bg-gray-300'
                      }`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any financial goals yet.</p>
              {!isAddingGoal && (
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Add Your First Goal
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Desktop view - keep existing desktop implementation
        // ... existing desktop render code ...
      )}
    </div>
  );
} 