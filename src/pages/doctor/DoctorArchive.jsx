import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, History, Loader2, ChevronRight } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";

export default function DoctorArchive() {
  const { doctorQueue, fetchDoctorQueue, isLoading, error } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const reviewedScans = doctorQueue.filter(s => s.status === "reviewed");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Archive</h1>
          <p className="text-slate-500 mt-1 font-medium">Permanent records of finalized clinical diagnostics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient UID or name..." 
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none w-64 bg-white shadow-sm"
            />
          </div>
          <Button variant="outline" className="border-slate-200 rounded-xl px-4 py-2.5 shadow-sm font-semibold">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden min-h-[500px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
           <History className="w-4 h-4 text-blue-600" />
           <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Finalized Clinical Records</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-blue-600">
             <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Patient Identity</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Final Verdict</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Action Plan</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Reviewed Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviewedScans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                       Archive is currently empty.
                    </td>
                  </tr>
                ) : (
                  reviewedScans.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => navigate(`/doctor/case/${patient.id}`)}>
                      <td className="px-6 py-5">
                         <p className="font-bold text-slate-900">{patient.patient_name}</p>
                         <p className="text-[10px] font-bold text-slate-400">UID: {patient.id?.substring(0,8)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {patient.final_diagnosis}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 font-medium italic max-w-[200px] truncate">
                        {patient.action_plan}
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 font-bold">
                        {new Date(patient.updated_at || patient.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="ghost" className="text-blue-600 font-black text-[10px] uppercase tracking-widest">View Full Report</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
