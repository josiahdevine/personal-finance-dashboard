const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const GoalController = require('../controllers/GoalController');

// Protect all routes
router.use(authenticateToken);

// Get all goals
router.get('/', GoalController.getGoals);

// Get goal by ID
router.get('/:id', GoalController.getGoalById);

// Create new goal
router.post('/', GoalController.createGoal);

// Update goal
router.put('/:id', GoalController.updateGoal);

// Delete goal
router.delete('/:id', GoalController.deleteGoal);

// Update goal progress
router.post('/:id/progress', GoalController.updateProgress);

module.exports = router; 