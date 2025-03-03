import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

// Function to create the salary_entries table if it doesn't exist
async function createSalaryEntriesTable() {
  try {
    // Create the table with the correct schema if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salary_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        user_profile_id VARCHAR(50) DEFAULT 'primary',
        company VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        salary_amount DECIMAL(19,4) NOT NULL,
        date_of_change DATE NOT NULL,
        notes TEXT,
        bonus_amount DECIMAL(19,4) DEFAULT 0,
        commission_amount DECIMAL(19,4) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_salary_entries_user_id ON salary_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_salary_entries_user_profile ON salary_entries(user_profile_id);
      CREATE INDEX IF NOT EXISTS idx_salary_entries_date ON salary_entries(date_of_change);
    `);
    console.log("Salary entries table created successfully");
  } catch (error) {
    console.error("Error creating salary entries table:", error);
    throw error;
  }
}

// Create the table when the module is loaded
createSalaryEntriesTable()
  .then(() => console.log("Salary entries table setup completed"))
  .catch(err => {
    console.error("Failed to create salary entries table:", err);
    process.exit(1); // Exit if we can't create the table
  });

// Function to get all salary entries for a user
async function getSalaryEntriesForUser(userId, userProfileId = 'primary') {
    try {
        const query = `
            SELECT *
            FROM salary_entries
            WHERE user_id = $1 AND user_profile_id = $2
            ORDER BY date_of_change DESC;
        `;
        const { rows } = await pool.query(query, [userId, userProfileId]);
        return rows;
    } catch (error) {
        console.error("Error fetching salary entries:", error);
        throw error;
    }
}

// Function to create a new salary entry
async function createSalaryEntry(salaryEntryData) {
    try {
        const { 
            user_id, 
            user_profile_id = 'primary',
            company, 
            position, 
            salary_amount, 
            date_of_change, 
            notes, 
            bonus_amount, 
            commission_amount 
        } = salaryEntryData;

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
            user_profile_id,
            company,
            position,
            salary_amount,
            date_of_change,
            notes,
            bonus_amount || 0,
            commission_amount || 0
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("Error creating salary entry:", error);
        throw error;
    }
}

// Function to update an existing salary entry
async function updateSalaryEntry(id, salaryEntryData) {
    try {
        const { 
            user_id, 
            user_profile_id,
            company, 
            position, 
            salary_amount, 
            date_of_change, 
            notes, 
            bonus_amount, 
            commission_amount 
        } = salaryEntryData;

        const query = `
            UPDATE salary_entries
            SET 
                user_id = $2,
                user_profile_id = $3,
                company = $4,
                position = $5,
                salary_amount = $6,
                date_of_change = $7,
                notes = $8,
                bonus_amount = $9,
                commission_amount = $10,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const values = [
            id,
            user_id,
            user_profile_id || 'primary',
            company,
            position,
            salary_amount,
            date_of_change,
            notes,
            bonus_amount || 0,
            commission_amount || 0
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error("Error updating salary entry:", error);
        throw error;
    }
}

// Function to delete a salary entry
async function deleteSalaryEntry(id) {
    try {
        const query = `
            DELETE FROM salary_entries
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error deleting salary entry:", error);
        throw error;
    }
}

export {
    getSalaryEntriesForUser,
    createSalaryEntry,
    updateSalaryEntry,
    deleteSalaryEntry
};