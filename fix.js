const fs = require('fs');

// Fix NewScan.jsx
let newScan = fs.readFileSync('src/pages/patient/NewScan.jsx', 'utf8');
newScan = newScan.replace(/navigate\(\/patient\/case\/\)/g, 'navigate(`/patient/case/${result.id}`)');
fs.writeFileSync('src/pages/patient/NewScan.jsx', newScan);

// Fix PatientReports.jsx
let reports = fs.readFileSync('src/pages/patient/PatientReports.jsx', 'utf8');
reports = reports.replace(/<span className=\{inline-flex items-center px-2\.5 py-0\.5 rounded-full text-xs font-medium \}>/g, '<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scan.status === \\'reviewed\\' ? \\'bg-green-100 text-green-800\\' : \\'bg-amber-100 text-amber-800\\'}`}>');
reports = reports.replace(/to=\{\/patient\/case\/\}/g, 'to={`/patient/case/${scan.id}`}');
fs.writeFileSync('src/pages/patient/PatientReports.jsx', reports);

// Fix CaseDetail.jsx
let detail = fs.readFileSync('src/pages/shared/CaseDetail.jsx', 'utf8');
detail = detail.replace(/className=\{px-3 py-1 rounded-full text-sm font-medium \}/g, 'className={`px-3 py-1 rounded-full text-sm font-medium ${style.badge}`}');
fs.writeFileSync('src/pages/shared/CaseDetail.jsx', detail);
