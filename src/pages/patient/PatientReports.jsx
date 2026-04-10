import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScans } from "../../context/ScanContext";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronRight, FileText } from "lucide-react";

export default function PatientReports() {
  const { patientHistory, fetchPatientHistory } = useScans();
  const { user } = useAuth();
  
  React.useEffect(() => {
    fetchPatientHistory();
  }, []);

  const myScans = patientHistory || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-500 mt-1">Review your scan history and doctor evaluations.</p>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Scan ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>   
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                      <FileText className="w-4 h-4" />
                    </div>
                    {scan.id?.substring(0,8)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(scan.created_at).toLocaleDateString()}</td>      
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scan.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100 transition-colors">  
                      <Link to={`/patient/case/${scan.id}`}>
                        View Case <ChevronRight className="w-4 h-4 ml-1" />  
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
