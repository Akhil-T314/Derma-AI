import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Clock, FileText, ArrowRight, ChevronRight, Settings, ClipboardList } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";
import { useAuth } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { patientHistory, fetchPatientHistory } = useScans();
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchPatientHistory();
  }, []);

  const myScans = patientHistory || [];

  const pendingReviews = myScans.filter(s => s.status !== "Reviewed").length;
  const recentScans = myScans.slice(0, 3); // Get top 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name || "Patient"}. Monitoring your dermatological health in real-time.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-blue-100 font-bold">
          <Link to="/patient/scan">Start New Clinical Scan</Link>
        </Button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Clinical Scans", value: myScans.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Final Medical Reports", value: myScans.filter(s => s.status === 'reviewed').length, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Specialist Review", value: pendingReviews, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((stat, i) => (
          <Card key={i} className="p-8 bg-white border-none shadow-sm rounded-3xl flex items-center space-x-6 ring-1 ring-slate-900/5">
            <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* RECENT SCANS TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Clinical Activity</h2>
          <Button asChild variant="ghost" size="sm" className="text-blue-600 font-bold">
            <Link to="/patient/reports">Open Full Archive <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        <Card className="overflow-hidden border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Analysis Date</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Diagnostic Findings</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Medical Status</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentScans.length > 0 ? recentScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/patient/case/${scan.id}`)}>
                  <td className="px-8 py-6 text-slate-600 font-medium">{new Date(scan.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900">
                      {scan.status === 'reviewed' ? scan.final_diagnosis : (scan.ai_prediction || "Processing...")}
                    </p>
                    {scan.risk_level && (
                      <span className={`text-[10px] font-black uppercase tracking-tight ${scan.risk_level === 'High' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {scan.risk_level} Risk Assessment
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      scan.status === "reviewed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {scan.status || "pending"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 inline transition-colors" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Your clinical archive is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

    </motion.div>
  );
}
