const { Pool } = require('pg');
require('dotenv').config({path: 'C:/Users/Alan roy/Desktop/thankachan-new/backend/.env'});
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
p.query('SELECT to_char(created_at, \'Mon DD HH12:MI AM\') as month_label, confidence_score as risk_score FROM Scans WHERE patient_id = \ ORDER BY created_at ASC', ['8822ddfb-9edd-433d-96ac-13da36100dee']).then(r => console.log(JSON.stringify(r.rows, null, 2))).catch(e => console.log(e)).finally(() => p.end());
