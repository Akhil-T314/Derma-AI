import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, AlertCircle, ChevronRight, User } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const mockPatients = [
  { id: "P-1042", name: "Sarah Connor", age: 45, lesion: "Melanoma", risk: "High", status: "Requires Review", date: "2026-04-06" },
  { id: "P-1089", name: "John Smith", age: 62, lesion: "Actinic Keratosis", risk: "Medium", status: "Pending", date: "2026-04-05" },
  { id: "P-1102", name: "Emily Chen", age: 28, lesion: "Benign Nevus", risk: "Low", status: "Reviewed", date: "2026-04-03" },
];

export default function DoctorDashboard() {
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Urgent Cases Panel */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Needs Attention</h2>
          {mockPatients.filter(p => p.risk === "High").map(patient => (
            <Card key={patient.id} className="p-4 bg-white border border-red-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-start space-x-3 pl-2">
                <div className="p-2 bg-red-50 rounded-full text-red-600 mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{patient.id} • {patient.age} yrs</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    {patient.lesion}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Patient List Panel */}
        <div className="lg:col-span-3">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Patient</th>
                    <th className="px-6 py-4 font-medium">AI Diagnosis</th>
                    <th className="px-6 py-4 font-medium">Risk Level</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Current Status</th>
                    <th className="px-6 py-4 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-xs text-gray-500">{patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{patient.lesion}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.risk === 'High' ? 'bg-red-100 text-red-800' : 
                          patient.risk === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{patient.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                          View Case <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
