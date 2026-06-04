import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Activity, AlertCircle, ChevronRight, Search } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";

export default function DoctorSurveillance() {
  const { doctorQueue, fetchDoctorQueue, isLoading } = useScans();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchDoctorQueue();
  }, []);

  // Filter for patients marked for "Monitor & re-scan in 3 months."
  const surveillanceCases = doctorQueue.filter(s => s.action_plan === "Monitor & re-scan in 3 months.");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Surveillance Watchlist</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Monitoring patients with lesions requiring periodic follow-up scans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
             <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <CalendarCheck className="w-4 h-4 text-blue-600" /> Active Clinical Surveillance
                </h2>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{surveillanceCases.length} Cases</span>
             </div>
             <div className="divide-y divide-slate-50">
                {surveillanceCases.length > 0 ? surveillanceCases.map((patient, i) => (
                  <div key={patient.id} onClick={() => navigate(`/doctor/case/${patient.id}`)} className="p-6 hover:bg-slate-50 transition-all flex justify-between items-center group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs bg-blue-50 text-blue-600`}>
                           {patient.patient_name?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900">{patient.patient_name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">{patient.final_diagnosis}</p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-6">
                        <div>
                           <p className="text-xs font-bold text-slate-900">Monitor in 3 Months</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 italic">Flagged on: {new Date(patient.updated_at).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" />
                     </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                     <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Active Surveillance Cases</p>
                     <p className="text-[10px] text-slate-400 mt-1">Cases marked for 'Monitor' will appear here automatically.</p>
                  </div>
                )}
             </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-blue-100 bg-blue-50/30 rounded-2xl">
              <Activity className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-black text-blue-900 mb-2">Clinical Protocol</h3>
              <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
                Surveillance is recommended for all atypical lesions with a risk index between 40-60%. Standard follow-up window is 90 days.
              </p>
           </Card>

           <Card className="p-6 border-slate-200 bg-white rounded-2xl">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Search Watchlist</h3>
              <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Patient name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-50" />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-6">
                Add New Surveillance Case
              </Button>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
