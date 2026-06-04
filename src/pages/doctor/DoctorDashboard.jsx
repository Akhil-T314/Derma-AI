import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, AlertCircle, ChevronRight, User, Loader2, CheckCircle, Activity, ClipboardList, History } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";

export default function DoctorDashboard() {
  const { doctorQueue, fetchDoctorQueue, isLoading, error } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const pendingScans = doctorQueue.filter(s => s.status !== "reviewed");
  const reviewedScans = doctorQueue.filter(s => s.status === "reviewed");
  const urgentScans = pendingScans.filter(p => p?.risk_level === "High");

  const malignantCount = reviewedScans.filter(s => s.final_diagnosis?.includes("Melanoma")).length;
  const bccCount = reviewedScans.filter(s => s.final_diagnosis?.includes("Basal Cell") || s.final_diagnosis?.includes("BCC")).length;
  const benignCount = reviewedScans.filter(s => s.final_diagnosis?.includes("Benign")).length;
  const totalReviewed = reviewedScans.length || 1; // Avoid div by zero

  const distribution = [
    { type: "Malignant Melanoma", count: malignantCount, percentage: Math.round((malignantCount / totalReviewed) * 100), color: "bg-red-500" },
    { type: "Basal Cell Carcinoma", count: bccCount, percentage: Math.round((bccCount / totalReviewed) * 100), color: "bg-amber-500" },
    { type: "Benign Nevus", count: benignCount, percentage: Math.round((benignCount / totalReviewed) * 100), color: "bg-emerald-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. CLINICAL INSIGHTS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
           <p className="text-slate-500 mt-1 font-medium text-sm">Practice performance & diagnostic impact analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Cases Finalized", value: reviewedScans.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12% this week" },
          { label: "Avg Risk Detection", value: "68%", icon: Activity, color: "text-blue-600", bg: "bg-blue-50", trend: "Normal range" },
          { label: "Pending Triage", value: pendingScans.length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", trend: `${urgentScans.length} urgent cases` }
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* DIAGNOSTIC DISTRIBUTION */}
        <Card className="xl:col-span-2 border-slate-200 bg-white shadow-sm rounded-2xl p-6">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Diagnostic Distribution</h2>
              <Button variant="ghost" className="text-xs font-bold text-blue-600">Export Report</Button>
           </div>
           
           <div className="space-y-6">
              {distribution.map((item, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{item.type}</span>
                      <span className="text-slate-400">{item.count} cases ({item.percentage}%)</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                 <Activity className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-black text-slate-900 uppercase tracking-tight">AI Confidence Correlation</p>
                 <p className="text-[11px] text-slate-500 font-medium mt-1">Your clinical verdicts align with AI high-confidence predictions in 98% of malignant cases.</p>
              </div>
           </div>
        </Card>

        {/* CLINICAL NOTICES */}
        <div className="space-y-6">
           <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Urgent Actions</h2>
              <div className="space-y-4">
                 {urgentScans.length > 0 ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                       <p className="text-xs font-black text-red-700">{urgentScans.length} Critical Cases Pending</p>
                       <p className="text-[10px] text-red-600 mt-1 font-medium italic">High-risk lesions require clinical verdict within 24 hours.</p>
                       <Button onClick={() => navigate('/doctor/queue')} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg py-4">
                          Open Triage Queue
                       </Button>
                    </div>
                 ) : (
                    <p className="text-xs text-slate-400 italic">No urgent actions required.</p>
                 )}
              </div>
           </Card>

           <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 gap-2">
                 <Button onClick={() => navigate('/doctor/queue')} variant="outline" className="justify-start text-xs font-bold text-slate-600 border-slate-100 py-6 hover:bg-slate-50">
                    <ClipboardList className="w-4 h-4 mr-3 text-blue-600" /> Active Queue
                 </Button>
                 <Button onClick={() => navigate('/doctor/history')} variant="outline" className="justify-start text-xs font-bold text-slate-600 border-slate-100 py-6 hover:bg-slate-50">
                    <History className="w-4 h-4 mr-3 text-slate-400" /> Clinical History
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
