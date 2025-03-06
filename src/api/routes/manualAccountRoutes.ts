import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/requireAuth';
import { pool } from '../db';

const router = Router();

// Validation schemas
const createAccountSchema = z.object({
  body: z.object({
    accountName: z.string().min(1).max(255),
    accountType: z.enum(['checking', 'savings', 'credit', 'investment', 'other']),
    balance: z.number().min(0),
    institution: z.string().max(255).optional(),
    notes: z.string().optional(),
  }),
});

const updateAccountSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    accountName: z.string().min(1).max(255).optional(),
    accountType: z.enum(['checking', 'savings', 'credit', 'investment', 'other']).optional(),
    balance: z.number().min(0).optional(),
    institution: z.string().max(255).optional(),
    notes: z.string().optional(),
  }),
});

// Routes
router.post(
  '/',
  requireAuth,
  validateRequest(createAccountSchema),
  async (req, res) => {
    const { accountName, accountType, balance, institution, notes } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `
        INSERT INTO manual_accounts (
          user_id,
          account_name,
          account_type,
          balance,
          institution,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [userId, accountName, accountType, balance, institution, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating manual account:', error);
      res.status(500).json({ message: 'Failed to create manual account' });
    }
  }
);

router.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Ensure users can only access their own accounts
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM manual_accounts WHERE user_id = $1',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching manual accounts:', error);
    res.status(500).json({ message: 'Failed to fetch manual accounts' });
  }
});

router.patch(
  '/:id',
  requireAuth,
  validateRequest(updateAccountSchema),
  async (req, res) => {
    const { id } = req.params;
    const { accountName, accountType, balance, institution, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Check if account exists and belongs to user
      const account = await pool.query(
        'SELECT * FROM manual_accounts WHERE id = $1',
        [id]
      );

      if (account.rows.length === 0) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (account.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const result = await pool.query(
        `
        UPDATE manual_accounts
        SET
          account_name = COALESCE($1, account_name),
          account_type = COALESCE($2, account_type),
          balance = COALESCE($3, balance),
          institution = COALESCE($4, institution),
          notes = COALESCE($5, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
        `,
        [accountName, accountType, balance, institution, notes, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating manual account:', error);
      res.status(500).json({ message: 'Failed to update manual account' });
    }
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check if account exists and belongs to user
    const account = await pool.query(
      'SELECT * FROM manual_accounts WHERE id = $1',
      [id]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM manual_accounts WHERE id = $1', [id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting manual account:', error);
    res.status(500).json({ message: 'Failed to delete manual account' });
  }
});

export default router; 