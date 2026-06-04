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
        preprocessed_image_url TEXT,
        ai_prediction VARCHAR(100),
        confidence_score DECIMAL,
        risk_level VARCHAR(20),
        recommendation TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        final_prediction VARCHAR(100),
        primary_prediction VARCHAR(100),
        primary_confidence DECIMAL,
        secondary_prediction VARCHAR(100),
        secondary_confidence DECIMAL,
        progression_risk DECIMAL,
        refinement_model VARCHAR(50),
        doctor_notes TEXT,
        private_clinical_notes TEXT,
        final_diagnosis TEXT,
        action_plan TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS age INTEGER;");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS medical_history TEXT;");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS qualifications TEXT;");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);");
      await pool.query("ALTER TABLE Users ADD COLUMN IF NOT EXISTS bio TEXT;");
      
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS localization VARCHAR(100);");
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS xai_lrp_url TEXT;");
      console.log('-> Clinical metadata columns checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS progression_risk DECIMAL;");
      console.log('-> Column progression_risk checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS refinement_model VARCHAR(50);");
      console.log('-> Column refinement_model checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS final_prediction VARCHAR(100);");
      console.log('-> Column final_prediction checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS primary_prediction VARCHAR(100);");
      console.log('-> Column primary_prediction checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS primary_confidence DECIMAL;");
      console.log('-> Column primary_confidence checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS secondary_prediction VARCHAR(100);");
      console.log('-> Column secondary_prediction checked');
      await pool.query("ALTER TABLE Scans ADD COLUMN IF NOT EXISTS secondary_confidence DECIMAL;");
      console.log('-> Column secondary_confidence checked');
    } catch(e) { console.log('Migration error:', e.message); }

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
