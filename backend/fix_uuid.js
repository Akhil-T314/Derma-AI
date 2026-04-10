const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function run() {
  await pool.query('UPDATE Users SET assigned_doctor_id = (SELECT doctor_id FROM Scans WHERE Scans.patient_id = Users.id AND doctor_id IS NOT NULL LIMIT 1)');
  await pool.query('UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = 
const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function r() {
  await p.query(\UPDATE Users SET assigned_doctor_id = (SELECT doctor_id FROM Scans WHERE Scans.patient_id = Users.id AND doctor_id IS NOT NULL LIMIT 1)\);
  await p.query(\UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = 'assigned' FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = 'pending' AND Users.assigned_doctor_id IS NOT NULL\);
  console.log('Fixed DB successfully!');
  p.end();
}
r();
assigned
const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function r() {
  await p.query(\UPDATE Users SET assigned_doctor_id = (SELECT doctor_id FROM Scans WHERE Scans.patient_id = Users.id AND doctor_id IS NOT NULL LIMIT 1)\);
  await p.query(\UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = 'assigned' FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = 'pending' AND Users.assigned_doctor_id IS NOT NULL\);
  console.log('Fixed DB successfully!');
  p.end();
}
r();
 FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = 
const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function r() {
  await p.query(\UPDATE Users SET assigned_doctor_id = (SELECT doctor_id FROM Scans WHERE Scans.patient_id = Users.id AND doctor_id IS NOT NULL LIMIT 1)\);
  await p.query(\UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = 'assigned' FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = 'pending' AND Users.assigned_doctor_id IS NOT NULL\);
  console.log('Fixed DB successfully!');
  p.end();
}
r();
pending
const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false} });
async function r() {
  await p.query(\UPDATE Users SET assigned_doctor_id = (SELECT doctor_id FROM Scans WHERE Scans.patient_id = Users.id AND doctor_id IS NOT NULL LIMIT 1)\);
  await p.query(\UPDATE Scans SET doctor_id = Users.assigned_doctor_id, status = 'assigned' FROM Users WHERE Scans.patient_id = Users.id AND Scans.status = 'pending' AND Users.assigned_doctor_id IS NOT NULL\);
  console.log('Fixed DB successfully!');
  p.end();
}
r();
 AND Users.assigned_doctor_id IS NOT NULL');
  console.log('Fixed gracefully');
  pool.end();
}
run();
