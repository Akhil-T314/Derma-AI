import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Search, Calendar, ChevronRight, Activity, Database, HeartPulse, SearchX, ShieldCheck, UserCheck } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse p-6">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
      ))}
    </div>
  </div>
);

export default function SystemActivity() {
  const { doctorQueue, patientHistory, fetchDoctorQueue, fetchPatientHistory } = useScans();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isAssigning, setIsAssigning] = useState(null); // ID of scan being assigned

  const fetchDoctors = async () => {
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const token = localStorage.getItem("token") || user.id;
      const res = await axios.get("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data.filter(u => u.role === 'doctor'));
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchDoctorQueue(), fetchPatientHistory(), fetchDoctors()]).then(() => {
      setIsLoading(false);
    });
  }, []);

  const handleAssignDoctor = async (scanId, doctorId) => {
    if (!doctorId) return;
    setIsAssigning(scanId);
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const token = localStorage.getItem("token") || user.id;
      
      await axios.put(`http://localhost:3000/api/scans/${scanId}/assign`, 
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh both queues to show updated status
      await Promise.all([fetchDoctorQueue(), fetchPatientHistory()]);
    } catch (err) {
      alert("Assignment failed: " + (err.response?.data?.error || err.message));
    } finally {
      setIsAssigning(null);
    }
  };

  const allSystemScans = [...(doctorQueue || []), ...(patientHistory || [])].sort((a, b) => 
    new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
  );

  const filteredScans = allSystemScans.filter(scan => 
    scan.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.ai_prediction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical Triage Feed</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Route and oversee all dermatological diagnostic cases</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDoctors}
            className="h-10 px-4 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-xs gap-2"
          >
            <Activity size={14} className="text-blue-600" /> SYNC CLINICAL STAFF
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Case ID or Patient..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none w-64 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <Card className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Diagnostic Case</th>
                  <th className="px-8 py-5">Patient Profile</th>
                  <th className="px-8 py-5">Triage Status</th>
                  <th className="px-8 py-5">Clinician Assignment</th>
                  <th className="px-8 py-5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredScans.map((scan) => (
                    <motion.tr 
                      key={scan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-105 ${
                            scan.risk_level === 'High' ? 'bg-red-500 shadow-red-100' : 'bg-blue-500 shadow-blue-100'
                          }`}>
                            <Activity size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                              {scan.patient?.name || scan.patientName || "Anonymous"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              ID: {scan.id.split('-')[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                           <span className="text-[11px] font-bold text-gray-700">
                             {scan.age || "N/A"}y • {scan.gender || "U"}
                           </span>
                           <span className="text-[10px] text-gray-400 font-medium">
                             {scan.localization || "Unspecified"}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            scan.risk_level === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {scan.ai_prediction || "Pending Inference"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {!scan.doctor_id ? (
                          <div className="relative">
                            <select 
                              onChange={(e) => handleAssignDoctor(scan.id, e.target.value)}
                              disabled={isAssigning === scan.id}
                              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[11px] font-bold text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer appearance-none pr-8"
                            >
                              <option value="">Unassigned</option>
                              {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                              ))}
                            </select>
                            <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none rotate-90" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold border border-indigo-200">
                                <ShieldCheck size={12} />
                             </div>
                             <span className="text-[11px] font-bold text-indigo-600 tracking-tight">Assigned to Staff</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/admin/case/${scan.id}`)}
                          className="h-9 px-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold rounded-xl transition-all group-hover:translate-x-1"
                        >
                          OPEN CASE <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <SearchX size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No diagnostic activity records found.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
