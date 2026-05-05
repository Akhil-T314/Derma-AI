require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('--- Starting Database Migration ---');

    console.log('1. Adding columns to Users table...');
    await pool.query(`
      ALTER TABLE Users 
      ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES Users(id),
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    `);

    console.log('2. Adding columns to Scans table...');
    await pool.query(`
      ALTER TABLE Scans 
      ADD COLUMN IF NOT EXISTS final_prediction VARCHAR(100),
      ADD COLUMN IF NOT EXISTS primary_prediction VARCHAR(100),
      ADD COLUMN IF NOT EXISTS primary_confidence DECIMAL,
      ADD COLUMN IF NOT EXISTS secondary_prediction VARCHAR(100),
      ADD COLUMN IF NOT EXISTS secondary_confidence DECIMAL,
      ADD COLUMN IF NOT EXISTS private_clinical_notes TEXT,
      ADD COLUMN IF NOT EXISTS action_plan TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS final_diagnosis TEXT,
      ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
    `);

    console.log('--- Migration Complete ---');
  } catch (err) {
    console.error('Migration Failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
