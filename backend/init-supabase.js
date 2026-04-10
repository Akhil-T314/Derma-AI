require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

const initDB = async () => {
  console.log("Connecting to Supabase to initialize schema...");
  try {
    // 1. EXTENSION
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 2. USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✅ Users table ensured.");

    // 3. SCANS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Scans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        patient_id UUID REFERENCES Users(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES Users(id) ON DELETE SET NULL,
        original_image_url TEXT NOT NULL,
        xai_heatmap_url TEXT,
        ai_prediction VARCHAR(100),
        confidence_score DECIMAL(5,2),
        risk_level VARCHAR(50),
        recommendation TEXT,
        doctor_notes TEXT,
        final_diagnosis VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pending Review',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✅ Scans table ensured.");

    // 4. SCAN PROGRESSIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Scan_Progressions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        scan_id UUID REFERENCES Scans(id) ON DELETE CASCADE,
        month_label VARCHAR(50) NOT NULL,
        risk_score DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✅ Scan_Progressions table ensured.");

    // 5. INSERT MOCK USERS for testing
    await pool.query(`
      INSERT INTO Users (id, full_name, email, role)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'John Doe (Patient)', 'patient@dermai.com', 'patient'),
        ('00000000-0000-0000-0000-000000000002', 'Dr. Sarah Smith', 'doctor@dermai.com', 'doctor'),
        ('00000000-0000-0000-0000-000000000003', 'Admin User', 'admin@dermai.com', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log("✅ Mock users verified.");

    console.log("🎉 Supabase Schema Initialization Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize Supabase schema:");
    console.error(error);
    process.exit(1);
  }
};

initDB();