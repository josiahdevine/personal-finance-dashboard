const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const GoalModel = require('../models/GoalModel');

// Protect all routes
router.use(authenticateToken);

// Get all goals for user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const goals = await GoalModel.getUserGoals(userId);
        res.json(goals);
    } catch (error) {
        console.error('Error getting goals:', error);
        res.status(500).json({ error: 'Failed to get goals' });
    }
});

// Create new goal
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const goal = await GoalModel.createGoal(userId, req.body);
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// Update goal progress
router.put('/:goalId/progress', async (req, res) => {
    try {
        const userId = req.user.id;
        const { goalId } = req.params;
        const { currentAmount } = req.body;
        
        const updated = await GoalModel.updateGoalProgress(
            goalId, userId, currentAmount
        );
        res.json(updated);
    } catch (error) {
        console.error('Error updating goal progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Delete goal
router.delete('/:goalId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { goalId } = req.params;
        
        await GoalModel.deleteGoal(goalId, userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// Get goal progress summary
router.get('/progress', async (req, res) => {
    try {
        const userId = req.user.id;
        const progress = await GoalModel.getGoalProgress(userId);
        res.json(progress);
    } catch (error) {
        console.error('Error getting goal progress:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

module.exports = router; 