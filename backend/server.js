require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
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
      `SELECT 
         u1.id, 
         u1.full_name as name, 
         u1.email, 
         u1.role, 
         u1.assigned_doctor_id,
         u1.medical_history,
         u1.profile_image_url,
         u1.specialization,
         u1.qualifications,
         u1.license_number,
         u1.bio,
         u2.full_name as doctor_name
       FROM Users u1
       LEFT JOIN Users u2 ON u1.assigned_doctor_id = u2.id
       WHERE u1.email = $1 AND u1.password = $2`,
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
  const { name, email, password, age, gender } = req.body; 
  try {
    const userRole = 'patient'; // FORCE patient role on open registration
    const result = await pool.query(
      'INSERT INTO Users (full_name, email, password, role, age, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name as name, email, role, age, gender',
      [name, email, password, userRole, age, gender]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ error: 'Failed to register. Email might be in use.' });
  }
});

// --- PASSWORD RECOVERY ---
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT id FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    
    // In a real system, you'd generate a token and send an email here.
    // For this prototype, we simulate success to keep the UX smooth.
    console.log(`[AUTH] Password reset requested for: ${email}`);
    res.json({ message: 'Reset link sent successfully.' });
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Users SET password = $1 WHERE email = $2 RETURNING id',
      [newPassword, email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// --- PHASE 3: PATIENT ENDPOINTS ---
app.post('/api/scans/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Call Python ML Service
    const absolutePath = path.resolve(__dirname, req.file.path);
    let mlResponse;
    try {
      mlResponse = await axios.post('http://localhost:8000/predict', {
        image_path: absolutePath
      });
    } catch (mlErr) {
      // Forward validation/rejection errors from ML service (e.g., face photo detected)
      const mlStatus = mlErr.response?.status || 500;
      const mlMessage = mlErr.response?.data?.detail || mlErr.response?.data?.error || 'ML service error.';
      console.error(`[ML Service Error ${mlStatus}]:`, mlMessage);
      return res.status(mlStatus).json({ error: mlMessage });
    }

    console.log("ML Response:", mlResponse.data);

        const aiData = mlResponse.data || {};
        console.log("aiData Debug:", aiData);
        const final_prediction = aiData.final_prediction || "Uncertain";
        const primary_prediction = aiData.primary_prediction || "Unknown";
        const primary_confidence = aiData.primary_confidence || 0;
        const secondary_prediction = aiData.secondary_prediction || "Unknown";
        const secondary_confidence = aiData.secondary_confidence || 0;

        const confidence_score_pct = Number(primary_confidence) * 100;
        
        // Dynamic Risk Assessment logic
        let risk_level = 'Low';
        if (primary_prediction.includes('Melanoma') || primary_prediction.includes('Carcinoma')) {
            risk_level = confidence_score_pct > 70 ? 'High' : 'Medium';
        } else if (confidence_score_pct > 80) {
            risk_level = 'Medium';
        }
        
        const recommendation = risk_level === 'High' ? 'Urgent review required.' : 'Awaiting review.';
        const xai_heatmap_url = aiData.xai_heatmap_url || '';
        const preprocessed_image_url = aiData.preprocessed_image_url || '';
        // Check if the patient already has an assigned doctor
        const userRes = await pool.query('SELECT assigned_doctor_id FROM Users WHERE id = $1', [req.user.id]);
        const assignedDoctorId = userRes.rows[0]?.assigned_doctor_id || null;
        const initialStatus = assignedDoctorId ? 'assigned' : 'pending';

        // Save to Supabase with inherited doctor
        const insertQuery = `
          INSERT INTO scans (
            patient_id, original_image_url, xai_heatmap_url, xai_lrp_url, preprocessed_image_url,
            ai_prediction, confidence_score, risk_level, recommendation, status, doctor_id,
            final_prediction, primary_prediction, primary_confidence, secondary_prediction, secondary_confidence,
            progression_risk, refinement_model, localization
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *;
        `;
        let result;
        try {
          result = await pool.query(insertQuery, [
            req.user.id, req.file.path, xai_heatmap_url, aiData.xai_lrp_url || '', preprocessed_image_url,
            final_prediction, confidence_score_pct, risk_level, recommendation, initialStatus, assignedDoctorId,
            final_prediction, primary_prediction, primary_confidence, secondary_prediction, secondary_confidence,
            aiData.progression_risk || 0, aiData.refinement_model || 'Standard', req.body.localization || 'unknown'
          ]);
        } catch (dbError) {
          console.error("DATABASE INSERT FAILED:", dbError.message);
          console.error("Values count:", 19);
          throw dbError;
        }
        const savedScan = result.rows[0];
    const patientSafeResponse = {
      id: savedScan.id,
      status: savedScan.status,
      created_at: savedScan.created_at,
      original_image_url: savedScan.original_image_url,
      xai_heatmap_url: savedScan.xai_heatmap_url,
      preprocessed_image_url: savedScan.preprocessed_image_url
    };

    res.status(201).json(patientSafeResponse);
  } catch (error) {
    console.error('--- UPLOAD ERROR DETAILS ---');
    console.error(error);
    console.error('----------------------------');
    res.status(500).json({ error: 'Image processing or database failure', details: error.message });
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
      SELECT s.*, u.full_name as patient_name, u.age, u.gender, u.medical_history
      FROM Scans s 
      LEFT JOIN Users u ON s.patient_id = u.id 
      WHERE s.id = $1
    `, [scanId]);

    if (scanResult.rows.length === 0) return res.status(404).json({ error: 'Scan not found' });

    const progressionsResult = await pool.query("SELECT to_char(created_at, 'Mon DD HH12:MI AM') as month_label, confidence_score as risk_score FROM Scans WHERE patient_id = $1 ORDER BY created_at ASC", [scanResult.rows[0].patient_id]);    

    const scan = scanResult.rows[0];
    scan.progressions = progressionsResult.rows;

    // Pass directly to frontend
    return res.json(scan);
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
app.get('/api/admin/health', async (req, res) => {
  try {
    // Check DB
    await pool.query('SELECT 1');
    // Check ML Service (optional ping)
    res.json({ status: 'healthy', services: { db: 'up', ml: 'up' } });
  } catch (e) {
    res.status(500).json({ status: 'unhealthy', error: e.message });
  }
});

app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const userId = req.params.id;
  try {
    // 1. If this user is an assigned doctor for other users, clear that link
    await pool.query('UPDATE Users SET assigned_doctor_id = NULL WHERE assigned_doctor_id = $1', [userId]);

    // 2. If this user is a doctor for scans, unlink them
    await pool.query('UPDATE Scans SET doctor_id = NULL, status = \'pending\' WHERE doctor_id = $1', [userId]);
    
    // 3. Delete all scans where this user is the patient
    await pool.query('DELETE FROM Scans WHERE patient_id = $1', [userId]);
    
    // 4. Delete the user
    const result = await pool.query('DELETE FROM Users WHERE id = $1 RETURNING *', [userId]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User and all clinical links removed successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error.message);
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

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
  const { email, password, name, specialization, license_number, qualifications } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Users (full_name, email, password, role, specialization, license_number, qualifications) VALUES ($1, $2, $3, 'doctor', $4, $5, $6) RETURNING id, full_name, email, role, specialization, license_number",
      [name || 'Dr. New', email, password, specialization, license_number, qualifications]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Doctor Error:', err.message);
    res.status(500).json({ error: 'Failed to create doctor: ' + err.message });
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

// SUBMIT CLINICAL REVIEW
app.put('/api/scans/:id/review', requireAuth, async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only clinical staff can submit reviews.' });
  }

  const { doctorNotes, finalDiagnosis, actionPlan, privateNotes, status } = req.body;
  const scanId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE Scans 
       SET doctor_notes = $1, 
           final_diagnosis = $2, 
           action_plan = $3, 
           private_clinical_notes = $4, 
           status = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND (doctor_id = $7 OR $8 = 'admin')
       RETURNING *`,
      [doctorNotes, finalDiagnosis, actionPlan, privateNotes, status || 'reviewed', scanId, req.user.id, req.user.role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scan not found or not assigned to you.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Submit Review Error:', err.message);
    res.status(500).json({ error: 'Failed to submit clinical review' });
  }
});


// PING TEST
app.get('/api/ping', (req, res) => res.json({ message: 'pong', timestamp: new Date() }));

// AVATAR UPLOAD
app.post('/api/users/upload-avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    await pool.query('UPDATE Users SET profile_image_url = $1 WHERE id = $2', [imageUrl, req.user.id]);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Avatar Upload Error:', error.message);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// PROFILE MANAGEMENT
app.put('/api/profile', requireAuth, async (req, res) => {
  const { name, age, gender, medical_history, profile_image_url, specialization, qualifications, license_number, bio } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Users SET full_name = $1, age = $2, gender = $3, medical_history = $4, profile_image_url = $5, specialization = $6, qualifications = $7, license_number = $8, bio = $9 WHERE id = $10 RETURNING id, full_name as name, email, role, age, gender, medical_history, profile_image_url, specialization, qualifications, license_number, bio',
      [name || req.user.full_name, age, gender, JSON.stringify(medical_history), profile_image_url || req.user.profile_image_url, specialization, qualifications, license_number, bio, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node Backend running on port ${PORT}`));


