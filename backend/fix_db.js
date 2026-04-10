const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function run() {
  try {
    await pool.query('UPDATE Users SET assigned_doctor_id = subquery.doc_id FROM (SELECT patient_id as p_id, MAX(doctor_id) as doc_id FROM Scans WHERE doctor_id IS NOT NULL GROUP BY patient_id) AS subquery WHERE Users.id = subquery.p_id');
    console.log('Fixed Users table');
    await pool.query('UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = ''assigned'' FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = ''pending'' AND Users.assigned_doctor_id IS NOT NULL');
    console.log('Fixed pending scans');
  } catch(e) {
    console.log(e);
  } finally {
    pool.end();
  }
}
run();
