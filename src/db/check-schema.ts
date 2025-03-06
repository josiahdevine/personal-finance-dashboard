import { pool } from './config';

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('Users table schema:', result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema(); 