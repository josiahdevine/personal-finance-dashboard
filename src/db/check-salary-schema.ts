import { pool } from './config';

async function checkSalarySchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'salary_entries'
      ORDER BY ordinal_position;
    `);
    
    console.log('Salary entries schema:', result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSalarySchema(); 