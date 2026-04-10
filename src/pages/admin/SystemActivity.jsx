import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const riskStyles = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-green-100 text-green-800"
};

export default function SystemActivity() {
  const { doctorQueue, patientHistory, fetchDoctorQueue, fetchPatientHistory } = useScans();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDoctorQueue(), fetchPatientHistory()]).then(() => {
      setIsLoading(false);
    });
  }, []);

  const allSystemScans = [...(doctorQueue || []), ...(patientHistory || [])];


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Activity</h1>
        <p className="text-gray-500 mt-1">Review all recent diagnostic scans across the platform.</p>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <SkeletonLoader />
        ) : allSystemScans && allSystemScans.length > 0 ? (
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 font-medium">Patient Name</th>
                  <th className="pb-3 font-medium">Prediction</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allSystemScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{scan.patient?.name || scan.patientName || "Unknown"}</td>
                    <td className="py-4 text-gray-700">{scan.ai_prediction || scan.lesion || "Pending"}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskStyles[scan.risk_level] || riskStyles[scan.riskLevel] || riskStyles.Low}`}>
                        {scan.risk_level || scan.riskLevel || "Low"}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500">{scan.status}</td>
                    <td className="py-4 text-gray-500">{scan.created_at ? new Date(scan.created_at).toLocaleDateString() : scan.date}</td>
                    <td className="py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/case/${scan.id}`)}>
                        View Case
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500 bg-gray-50 border-t border-dashed border-gray-200">
            No records to display.
          </div>
        )}
      </Card>
    </motion.div>
  );
}
