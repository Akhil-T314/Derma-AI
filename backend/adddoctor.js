
const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
pool.query("ALTER TABLE users ADD COLUMN assigned_doctor_id UUID REFERENCES users(id)").then(() => console.log("Added")).catch(e => console.log(e)).finally(() => pool.end());
