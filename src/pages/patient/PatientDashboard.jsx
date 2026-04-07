import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Clock, FileText, ArrowRight } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const mockRecentScans = [
  { id: 1, date: "2026-04-01", result: "Benign", confidence: "98%", status: "Reviewed" },
  { id: 2, date: "2026-03-15", result: "Actinic Keratosis", confidence: "87%", status: "Needs Review" },
];

export default function PatientDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Patient</h1>
          <p className="text-gray-500 mt-1">Here is your dermatological health overview.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2">
          <Link to="/patient/scan">Start New Scan</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Scans</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recent Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">2</h3>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
            <h3 className="text-2xl font-bold text-gray-900">1</h3>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Scans</h2>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-xl bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">AI Prediction</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRecentScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{scan.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{scan.result}</td>
                  <td className="px-6 py-4 text-gray-600">{scan.confidence}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scan.status === "Reviewed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </motion.div>
  );
}
