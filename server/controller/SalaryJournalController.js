import SalaryEntryModel from '../models/SalaryEntryModel.js';
import pool from '../db.js';

const createSalaryEntry = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);

    const { company, position, salary_amount, date_of_change, notes, bonus_amount, commission_amount, user_profile_id } = req.body;
    const user_id = req.user.userId;

    // Log the extracted values
    console.log('Extracted values:', {
      user_id,
      user_profile_id,
      company,
      position,
      salary_amount,
      date_of_change,
      notes,
      bonus_amount,
      commission_amount
    });

    // Validate required fields
    if (!company || !position || !salary_amount || !date_of_change) {
      const missingFields = [];
      if (!company) missingFields.push('company');
      if (!position) missingFields.push('position');
      if (!salary_amount) missingFields.push('salary_amount');
      if (!date_of_change) missingFields.push('date_of_change');
      
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate numeric fields
    const numericFields = {
      salary_amount: parseFloat(salary_amount),
      bonus_amount: bonus_amount ? parseFloat(bonus_amount) : 0,
      commission_amount: commission_amount ? parseFloat(commission_amount) : 0
    };

    const invalidFields = Object.entries(numericFields)
      .filter(([_, value]) => isNaN(value))
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      console.log('Invalid numeric values:', invalidFields);
      return res.status(400).json({ 
        message: 'Invalid numeric values', 
        invalidFields 
      });
    }

    // Validate user_id
    if (!user_id) {
      console.log('Missing user_id from token');
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const query = `
      INSERT INTO salary_entries (
        user_id, 
        user_profile_id,
        company, 
        position, 
        salary_amount, 
        date_of_change, 
        notes, 
        bonus_amount, 
        commission_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    
    const values = [
      user_id,
      user_profile_id || 'primary',
      company, 
      position, 
      numericFields.salary_amount,
      date_of_change,
      notes || '',
      numericFields.bonus_amount,
      numericFields.commission_amount
    ];
    
    console.log('Executing query with values:', values);
    
    const { rows } = await pool.query(query, values);
    console.log('Salary entry created:', rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating salary entry:", error);
    console.error("Error stack:", error.stack);
    
    // Check for specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        message: "A salary entry with these details already exists",
        error: error.detail
      });
    }
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ 
        message: "Invalid user reference",
        error: error.detail
      });
    }
    
    res.status(500).json({ 
      message: "Error creating salary entry", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getSalaryJournal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfileId = req.query.userProfileId || 'primary';
    
    const query = `
      SELECT *
      FROM salary_entries
      WHERE user_id = $1 AND user_profile_id = $2
      ORDER BY date_of_change DESC;
    `;
    
    const { rows } = await pool.query(query, [userId, userProfileId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching salary entries:", error);
    res.status(500).json({ message: "Error fetching salary entries", error: error.message });
  }
};

const updateSalaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { company, position, salary_amount, date_of_change, notes, bonus_amount, commission_amount } = req.body;

    // Validate required fields
    if (!company || !position || !salary_amount || !date_of_change) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify ownership
    const checkQuery = 'SELECT user_id FROM salary_entries WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Salary entry not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }

    const query = `
      UPDATE salary_entries
      SET company = $1, position = $2, salary_amount = $3, date_of_change = $4,
          notes = $5, bonus_amount = $6, commission_amount = $7
      WHERE id = $8 AND user_id = $9
      RETURNING *;
    `;
    const values = [company, position, salary_amount, date_of_change, notes, bonus_amount || 0, commission_amount || 0, id, userId];
    
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Salary entry not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating salary entry:", error);
    res.status(500).json({ message: "Error updating salary entry", error: error.message });
  }
};

const deleteSalaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const checkQuery = 'SELECT user_id FROM salary_entries WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Salary entry not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    const query = 'DELETE FROM salary_entries WHERE id = $1 AND user_id = $2';
    await pool.query(query, [id, userId]);
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting salary entry:", error);
    res.status(500).json({ message: "Error deleting salary entry", error: error.message });
  }
};

export default {
  createSalaryEntry,
  getSalaryJournal,
  updateSalaryEntry,
  deleteSalaryEntry
};