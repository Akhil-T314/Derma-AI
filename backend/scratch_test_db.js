const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Alankroy%40762003@db.dmbxsexwujnfbqsdqsew.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testInsert() {
  try {
    const mockData = {
      user_id: 'a2482314-9128-470d-b68d-11169b35f63f', // Use a real UUID from the DB
      image_path: 'uploads/test.jpg',
      xai_heatmap_url: 'uploads/xai_test.jpg',
      xai_lrp_url: 'uploads/lrp_test.jpg',
      preprocessed_image_url: 'uploads/pre_test.jpg',
      final_prediction: 'Melanoma',
      confidence_score_pct: 85.5,
      risk_level: 'High',
      recommendation: 'Urgent',
      initialStatus: 'pending',
      assignedDoctorId: null,
      primary_prediction: 'Melanoma',
      primary_confidence: 0.855,
      secondary_prediction: 'Nevi',
      secondary_confidence: 0.1,
      progression_risk: 0.75,
      refinement_model: 'XGBoost v2.1'
    };

    // First find a real user id
    const users = await pool.query('SELECT id FROM Users LIMIT 1');
    if (users.rows.length === 0) throw new Error('No users found');
    const userId = users.rows[0].id;

    const insertQuery = `
      INSERT INTO Scans (
        patient_id, original_image_url, xai_heatmap_url, xai_lrp_url, preprocessed_image_url,
        ai_prediction, confidence_score, risk_level, recommendation, status, doctor_id,
        final_prediction, primary_prediction, primary_confidence, secondary_prediction, secondary_confidence,
        progression_risk, refinement_model
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;
    `;

    const values = [
      userId, mockData.image_path, mockData.xai_heatmap_url, mockData.xai_lrp_url, mockData.preprocessed_image_url,
      mockData.final_prediction, mockData.confidence_score_pct, mockData.risk_level, mockData.recommendation, mockData.initialStatus, mockData.assignedDoctorId,
      mockData.final_prediction, mockData.primary_prediction, mockData.primary_confidence, mockData.secondary_prediction, mockData.secondary_confidence,
      mockData.progression_risk, mockData.refinement_model
    ];

    console.log('Attempting insert with', values.length, 'values');
    const result = await pool.query(insertQuery, values);
    console.log('Insert successful:', result.rows[0].id);
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
  } finally {
    pool.end();
  }
}

testInsert();
