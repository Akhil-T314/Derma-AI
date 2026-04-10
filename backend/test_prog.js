const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
p.query("SELECT to_char(created_at, 'Mon DD YYYY') as month_label, confidence_score as risk_score FROM Scans WHERE patient_id = (SELECT patient_id FROM Scans LIMIT 1 OFFSET 1)").then(r => { console.log(JSON.stringify(r.rows, null, 2)); p.end(); });
