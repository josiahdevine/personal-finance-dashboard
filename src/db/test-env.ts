import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Database URL:', process.env.REACT_APP_NEON_DATABASE_URL);
console.log('Environment variables loaded:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))); 