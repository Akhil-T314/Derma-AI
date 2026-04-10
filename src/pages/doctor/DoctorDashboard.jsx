import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, AlertCircle, ChevronRight, User, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useScans } from "../../context/ScanContext";

export default function DoctorDashboard() {
  const { doctorQueue, fetchDoctorQueue, isLoading, error } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Dashboard</h1>
          <p className="text-gray-500 mt-1">Review AI predictions and manage patient cases.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64 shadow-sm"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2 border-gray-200 shadow-sm py-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-blue-600">
           <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
           <AlertCircle className="w-5 h-5" />
           {error}
        </div>
      ) : (
      <div className="flex flex-col space-y-8">
        {/* Urgent Cases Panel */}
        <Card className="w-full bg-white border border-red-100 shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Needs Attention</h2>
            </div>
            <span className="flex items-center justify-center bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
              {doctorQueue.filter(p => p?.risk_level === "High").length} Urgent Cases
            </span>
          </div>
          <div className="p-5 bg-gray-50/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {doctorQueue.filter(p => p?.risk_level === "High").map((patient, idx) => (
            <Card key={patient?.id || `urgent-${idx}`} onClick={() => navigate(`/doctor/case/${patient?.id}`)} className="p-4 bg-white border border-red-200 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-start space-x-3 pl-2">
                <div className="p-2 bg-red-50 rounded-full text-red-700 mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient?.patient_name || "Unknown Patient"}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {patient?.id?.split('-')[0]}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    {patient?.ai_prediction || "Unknown Lesion"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          </div>
        </Card>

        {/* Patient List Panel */}
        <div className="w-full">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Pending Queue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Patient Name</th>
                    <th className="px-6 py-4 font-medium">AI Diagnosis</th>
                    <th className="px-6 py-4 font-medium">Risk Level</th>
                    <th className="px-6 py-4 font-medium">Upload Date</th>
                    <th className="px-6 py-4 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctorQueue.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                         No pending scans requiring review.
                      </td>
                    </tr>
                  )}
                  {doctorQueue.map((patient, idx) => {
                    if (!patient) return null;
                    return (
                    <tr key={patient.id || `patient-row-${idx}`} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/doctor/case/${patient.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{patient.patient_name || "Unknown Patient"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{patient.ai_prediction}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.risk_level === 'High' ? 'bg-red-100 text-red-800' : 
                          patient.risk_level === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(patient.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                          View Case <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      )}
    </motion.div>
  );
}
