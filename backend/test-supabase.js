require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const verifyConfig = async () => {
  console.log("Testing Supabase Connection...");
  try {
    const timeRes = await pool.query('SELECT NOW()');
    console.log("✅ Successfully connected to Supabase:", timeRes.rows[0].now);

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("✅ Tables found in Supabase:", tables.rows.map(r => r.table_name).join(', '));

    const userCount = await pool.query('SELECT COUNT(*) FROM Users');
    console.log("✅ Total Users injected:", userCount.rows[0].count);

    process.exit(0);
  } catch (err) {
    console.error("❌ Supabase verification failed!", err.message);
    process.exit(1);
  }
};

verifyConfig();