require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    console.log('--- Initializing Database ---');

    console.log('1. Ensuring Users Table Exists & has password');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'patient',
        full_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add password column if it somehow is missing from an older schema pattern
    try {
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS password TEXT;");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'patient';");
    } catch(e) { console.log('Columns likely exist', e.message); }

    console.log('2. Ensuring Scans Table Exists');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Scans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES Users(id),
        doctor_id UUID REFERENCES Users(id) NULL,
        original_image_url TEXT,
        xai_heatmap_url TEXT,
        ai_prediction VARCHAR(50),
        confidence_score DECIMAL,
        risk_level VARCHAR(20),
        recommendation TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('3. Seeding Default Admin');
    const adminCheck = await pool.query("SELECT * FROM Users WHERE email = 'admin@dermai.com'");
    if (adminCheck.rows.length === 0) {
      await pool.query("INSERT INTO Users (email, password, role, full_name) VALUES ('admin@dermai.com', '123456', 'admin', 'System Admin')");
      console.log('-> Inserted Admin (admin@dermai.com)');
    } else {
      console.log('-> Admin already exists');
    }

    console.log('4. Seeding Default Doctor');
    const doctorCheck = await pool.query("SELECT * FROM Users WHERE email = 'doctor@dermai.com'");
    if (doctorCheck.rows.length === 0) {
      await pool.query("INSERT INTO Users (email, password, role, full_name) VALUES ('doctor@dermai.com', '123456', 'doctor', 'Dr. Default')");
      console.log('-> Inserted Doctor (doctor@dermai.com)');
    } else {
      console.log('-> Doctor already exists');
    }

    console.log('--- DB Init Complete ---');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

initDB();
