const fs = require('fs');
let serverFile = fs.readFileSync('backend/server.js', 'utf8');

// 1. Add action_plan column on startup
if (!serverFile.includes('ALTER TABLE Scans ADD COLUMN IF NOT EXISTS action_plan TEXT;')) {
    serverFile = serverFile.replace(
        'app.listen(port',
        `pool.query('ALTER TABLE Scans ADD COLUMN IF NOT EXISTS action_plan TEXT;').catch(e => console.error("Could not add action_plan column:", e));\napp.listen(port`
    );
}

// 2. Update GET endpoint patientSafeScan
serverFile = serverFile.replace(
    /doctor_notes: scan\.status === 'reviewed' \? scan\.doctor_notes : null,/g,
    `doctor_notes: scan.status === 'reviewed' ? scan.doctor_notes : null,\n        action_plan: scan.status === 'reviewed' ? scan.action_plan : null,`
);

// 3. Update PUT review endpoint
serverFile = serverFile.replace(
    /const \{ doctorNotes, finalDiagnosis, status \} = req\.body;/g,
    `const { doctorNotes, finalDiagnosis, actionPlan, status } = req.body;`
);

serverFile = serverFile.replace(
    /UPDATE Scans SET doctor_notes = \$1, final_diagnosis = \$2, status = \$3, doctor_id = \$4, updated_at = NOW\(\)\n      WHERE id = \$5 RETURNING \*;/g,
    `UPDATE Scans SET doctor_notes = $1, final_diagnosis = $2, action_plan = $3, status = $4, doctor_id = $5, updated_at = NOW()\n      WHERE id = $6 RETURNING *;`
);

serverFile = serverFile.replace(
    /const result = await pool\.query\(query, \[doctorNotes, finalDiagnosis, status, req\.user\.id, req\.params\.id\]\);/g,
    `const result = await pool.query(query, [doctorNotes, finalDiagnosis, actionPlan, status, req.user.id, req.params.id]);`
);

fs.writeFileSync('backend/server.js', serverFile);
console.log('backend updated');
