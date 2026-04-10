
const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $$users$$").then(r => console.log(JSON.stringify(r.rows, null, 2))).catch(e => console.log(e)).finally(() => pool.end());
