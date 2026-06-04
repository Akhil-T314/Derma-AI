import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, Loader2, ClipboardList } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useScans } from "../../context/ScanContext";

export default function DoctorTriage() {
  const { doctorQueue, fetchDoctorQueue, isLoading, error } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const pendingScans = doctorQueue.filter(s => s.status !== "reviewed");
  const urgentScans = pendingScans.filter(p => p?.risk_level === "High");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Clinical Triage</h1>
          <p className="text-slate-500 mt-1 font-medium">Prioritize and review pending dermatological cases.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-blue-600">
           <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
           <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Needs Attention Panel */}
          <Card className="border-red-100 bg-white shadow-sm rounded-2xl overflow-hidden ring-1 ring-red-900/5">
            <div className="p-5 border-b border-red-100 bg-red-50/30 flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" /> High-Risk Priority Alerts
              </h2>
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                {urgentScans.length} Urgent
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentScans.length > 0 ? urgentScans.map((patient) => (
                <Card key={patient.id} onClick={() => navigate(`/doctor/case/${patient.id}`)} className="p-5 border-slate-200 hover:border-red-300 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-base">{patient.patient_name}</p>
                      <p className="text-[10px] font-black text-red-600 uppercase mt-1 italic tracking-widest">{patient.ai_prediction}</p>
                      <div className="mt-4 flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400">UID: {patient.id?.substring(0,8)}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-full py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                   <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Critical Alerts Pending</p>
                </div>
              )}
            </div>
          </Card>

          {/* General Queue */}
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Full Pending Workload</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Patient Identity</th>
                     <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">AI Prediction</th>
                     <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Triage Level</th>
                     <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Progression</th>
                     <th className="px-6 py-4 text-right"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {pendingScans.length === 0 ? (
                     <tr>
                       <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                          All cases have been successfully triaged.
                       </td>
                     </tr>
                   ) : (
                     pendingScans.map((patient) => (
                       <tr key={patient.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => navigate(`/doctor/case/${patient.id}`)}>
                         <td className="px-6 py-5">
                            <div className="flex items-center">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                 {patient.patient_name?.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-bold text-slate-900">{patient.patient_name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">REFE: {patient.id?.substring(0,8)}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5 font-bold text-slate-700">{patient.ai_prediction}</td>
                         <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                             patient.risk_level === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                             'bg-emerald-50 text-emerald-700 border-emerald-100'
                           }`}>
                             {patient.risk_level}
                           </span>
                         </td>
                         <td className="px-6 py-5">
                            <span className={`text-xs font-black ${patient.progression_risk > 0.5 ? 'text-red-600' : 'text-amber-600'}`}>
                              {Math.round(patient.progression_risk * 100)}%
                            </span>
                         </td>
                         <td className="px-6 py-5 text-right">
                           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 inline" />
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
