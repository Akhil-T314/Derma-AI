require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('../ml-service/processed'));

// Connect to Supabase Hosted PostgreSQL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Configure local storage for uploads
const upload = multer({ dest: 'uploads/' });

// --- AUTH MIDDLEWARE ---
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const result = await pool.query('SELECT * FROM Users WHERE id = $1', [token]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid User' });
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(500).json({ error: 'Server auth error' });
  }
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // In production, compare hashed passwords. For MVP, matching plain text if DB stores it.
    const result = await pool.query(
      'SELECT id, full_name as name, email, role FROM Users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body; // Always ignore any sent role
  try {
    const userRole = 'patient'; // FORCE patient role on open registration
    const result = await pool.query(
      'INSERT INTO Users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name as name, email, role',
      [name, email, password, userRole]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ error: 'Failed to register. Email might be in use.' });
  }
});

// --- PHASE 3: PATIENT ENDPOINTS ---
app.post('/api/scans/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Call Python ML Service
    const mlResponse = await axios.post('http://localhost:8000/predict', {
      image_path: req.file.path
    });

    const { ai_prediction, confidence_score, risk_level, recommendation, xai_heatmap_url } = mlResponse.data;

      // Check if the patient already has an assigned doctor
      const userRes = await pool.query('SELECT assigned_doctor_id FROM Users WHERE id = $1', [req.user.id]);
      const assignedDoctorId = userRes.rows[0]?.assigned_doctor_id || null;
      const initialStatus = assignedDoctorId ? 'assigned' : 'pending';

      // Save to Supabase with inherited doctor
      const insertQuery = `
        INSERT INTO Scans (patient_id, original_image_url, xai_heatmap_url, ai_prediction, confidence_score, risk_level, recommendation, status, doctor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
      `;
      const result = await pool.query(insertQuery, [
        req.user.id, req.file.path, xai_heatmap_url, ai_prediction, confidence_score, risk_level, recommendation, initialStatus, assignedDoctorId
      ]);

    const newScan = result.rows[0];

    const patientSafeResponse = {
      id: newScan.id,
      status: newScan.status,
      created_at: newScan.created_at,
      original_image_url: newScan.original_image_url
    };

    res.status(201).json(patientSafeResponse);
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: 'Image processing or database failure' });
  }
});

app.get('/api/scans/my-history', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Scans WHERE patient_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const sanitizedRows = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      original_image_url: row.original_image_url,
      final_diagnosis: row.status === 'reviewed' ? row.final_diagnosis : null,
      doctor_notes: row.status === 'reviewed' ? row.doctor_notes : null
    }));
    res.json(sanitizedRows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// --- PHASE 4: DOCTOR ENDPOINTS ---
app.get('/api/scans/queue', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.full_name as patient_name 
      FROM Scans s 
      LEFT JOIN Users u ON s.patient_id = u.id 
      WHERE s.status = 'pending' 
      ORDER BY s.created_at ASC
    `);
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

app.get('/api/scans/:id', requireAuth, async (req, res) => {
  try {
    const scanId = req.params.id;
    if (scanId === 'queue' || scanId === 'my-history' || scanId === 'upload') return; // explicit prevent
    const scanResult = await pool.query(`
      SELECT s.*, u.full_name as patient_name 
      FROM Scans s 
      LEFT JOIN Users u ON s.patient_id = u.id 
      WHERE s.id = $1
    `, [scanId]);
    if (scanResult.rows.length === 0) return res.status(404).json({ error: 'Scan not found' });
    
    const progressionsResult = await pool.query("SELECT to_char(created_at, 'Mon DD HH12:MI AM') as month_label, confidence_score as risk_score FROM Scans WHERE patient_id = $1 ORDER BY created_at ASC", [scanResult.rows[0].patient_id]);
    
    // Construct single unified object
    const scan = scanResult.rows[0];
    scan.progressions = progressionsResult.rows;
    if (req.user.role === 'patient') {
      const patientSafeScan = {
        id: scan.id,
        patient_id: scan.patient_id,
        status: scan.status,
        created_at: scan.created_at,
        original_image_url: scan.original_image_url,
        final_diagnosis: scan.status === 'reviewed' ? scan.final_diagnosis : null,
        doctor_notes: scan.status === 'reviewed' ? scan.doctor_notes : null,
        action_plan: scan.status === 'reviewed' ? scan.action_plan : null,
        progressions: []
      };
      return res.json(patientSafeScan);
    }
    res.json(scan);
  } catch (e) {
    console.error('GET /api/scans/:id Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch scan details' });
  }
});

app.put('/api/scans/:id/review', requireAuth, async (req, res) => {
  const { doctorNotes, privateNotes, finalDiagnosis, actionPlan, status } = req.body;
  try {
    const query = `
      UPDATE Scans SET doctor_notes = $1, final_diagnosis = $2, status = $3, doctor_id = $4, private_clinical_notes = $5, action_plan = $6, updated_at = NOW()
      WHERE id = $7 RETURNING *;
    `;
    const result = await pool.query(query, [doctorNotes, finalDiagnosis, status, req.user.id, privateNotes, actionPlan, req.params.id]);
    res.json(result.rows[0]);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// --- PHASE 5: ADMIN ENDPOINTS ---
app.get('/api/admin/analytics', requireAuth, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) as count FROM Scans');
    const highRisk = await pool.query("SELECT COUNT(*) as count FROM Scans WHERE risk_level = 'High'");
    res.json({ totalScans: parseInt(total.rows[0].count), highRiskScans: parseInt(highRisk.rows[0].count) });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to run analytics' });
  }
});

app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, role, status FROM Users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/api/admin/clean_db', async (req, res) => {
  try {
    await pool.query('DELETE FROM Scan_Progressions');
    await pool.query('DELETE FROM Scans');
    // If you also want to wipe users, do: await pool.query('DELETE FROM Users');
    res.json({ message: 'Cleaned DB.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- NEW ADMIN & ASSIGNMENT ENDPOINTS ---

app.post('/api/admin/create-doctor', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can create doctors' });
  const { email, password, name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Users (full_name, email, password, role) VALUES ($1, $2, $3, 'doctor') RETURNING id, full_name, email, role",
      [name || 'Dr. New', email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Doctor Error:', err.message);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

app.put('/api/scans/:id/assign', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can assign scans' });
  const { doctor_id } = req.body;
  try {
      // Find the patient associated with this scan
      const scanInfo = await pool.query('SELECT patient_id FROM Scans WHERE id = $1', [req.params.id]);
      if (scanInfo.rows.length === 0) return res.status(404).json({ error: 'Scan not found' });
      const patientId = scanInfo.rows[0].patient_id;

      // Assign the doctor to the PATIENT for all future and current scans
      await pool.query('UPDATE Users SET assigned_doctor_id = $1 WHERE id = $2', [doctor_id, patientId]);

      // Retroactively assign ALL scans for this patient to the assigned doctor
      const result = await pool.query(
        "UPDATE Scans SET doctor_id = $1, status = CASE WHEN status = 'pending' THEN 'assigned' ELSE status END WHERE patient_id = $2 RETURNING *",
        [doctor_id, patientId]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Assign Error:', err.message);
      res.status(500).json({ error: 'Failed to assign patient scans' });
    }
});

app.get('/api/doctor/scans', requireAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    try {
      const result = await pool.query(`
        SELECT s.*, u.full_name as patient_name 
        FROM Scans s 
        LEFT JOIN Users u ON s.patient_id = u.id 
        ORDER BY s.created_at DESC
      `);
      return res.json(result.rows);
    } catch(err) {
      return res.status(500).json({ error: 'Failed' });
    }
  }
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can view their assigned scans' });
  try {
    const result = await pool.query(
      `SELECT s.*, u.full_name as patient_name 
       FROM Scans s 
       LEFT JOIN Users u ON s.patient_id = u.id 
       WHERE s.doctor_id = $1 
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Doctor Scans Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch doctor scans' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node Backend running on port ${PORT}`));


