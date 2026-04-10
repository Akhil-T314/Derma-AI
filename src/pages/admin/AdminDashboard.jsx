import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Users, Activity, AlertTriangle, ShieldCheck, UserPlus, FileText } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ totalScans: 0, highRiskScans: 0, activeUsers: 0 });
  const [doctors, setDoctors] = useState([]);
  const [unassignedScans, setUnassignedScans] = useState([]);
  
  const [newDocName, setNewDocName] = useState("");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocPassword, setNewDocPassword] = useState("");
  const [docMsg, setDocMsg] = useState({ type: "", text: "" });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [analyticsRes, usersRes, queueRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/analytics", { headers }),
        axios.get("http://localhost:3000/api/admin/users", { headers }),
        axios.get("http://localhost:3000/api/scans/queue", { headers })
      ]);

      setStats({
        totalScans: analyticsRes.data.totalScans || 0,
        highRiskScans: analyticsRes.data.highRiskScans || 0,
        activeUsers: usersRes.data.length || 0,
      });
      
      setDoctors(usersRes.data.filter(u => u.role === "doctor"));
      setUnassignedScans(queueRes.data.filter(s => !s.doctor_id));
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDocMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
      await axios.post("http://localhost:3000/api/admin/create-doctor", 
        { name: newDocName, email: newDocEmail, password: newDocPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocMsg({ type: "success", text: "Doctor created successfully!" });
      setNewDocName(""); setNewDocEmail(""); setNewDocPassword("");
      fetchDashboardData();
    } catch (err) {
      setDocMsg({ type: "error", text: err.response?.data?.error || "Error creating doctor." });
    }
  };

  const handleAssignDoctor = async (scanId, doctorId) => {
    if (!doctorId) return alert("Select a doctor first!");
    try {
      const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
      await axios.put(`http://localhost:3000/api/scans/${scanId}/assign`, 
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (err) {
      alert("Failed to assign doctor.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 mt-1">Manage system analytics, doctors, and scan assignments.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">Loading system data...</div>
      ) : error ? (
        <div className="h-40 flex items-center justify-center text-red-500 bg-red-50 rounded-xl">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Total Scans</span>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalScans}</span>
            </Card>
            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">High Risk Cases</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.highRiskScans}</span>
            </Card>
            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Active Users</span>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.activeUsers}</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Create New Doctor</h2>
              </div>
              
              {docMsg.text && (
                <div className={`mb-4 p-3 rounded text-sm ${docMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {docMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" required value={newDocName} onChange={e => setNewDocName(e.target.value)} className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" required value={newDocEmail} onChange={e => setNewDocEmail(e.target.value)} className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" required value={newDocPassword} onChange={e => setNewDocPassword(e.target.value)} className="w-full border rounded-md p-2" />
                </div>
                <Button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700">Add Doctor</Button>
              </form>
            </Card>

            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col max-h-[500px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Pending Assignments ({unassignedScans.length})</h2>
              </div>
              
              {unassignedScans.length === 0 ? (
                <p className="text-gray-500 text-sm text-center my-auto">No scans pending assignment.</p>
              ) : (
                <div className="space-y-4">
                  {unassignedScans.map(scan => (
                    <div key={scan.id} className="border p-4 rounded-lg flex flex-col gap-3 shadow-sm bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Scan #{scan.id.split('-')[0]}</p>                            <p className="text-xs text-gray-700 font-medium">Patient: {scan.patient_name || "Unknown Patient"}</p>                          <p className="text-xs text-red-600 font-medium">Risk: {scan.risk_level}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select 
                          id={`assign-${scan.id}`} 
                          className="flex-1 border rounded-md text-sm p-2 bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>Select Doctor</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
                          ))}
                        </select>
                        <Button 
                          onClick={() => {
                            const sel = document.getElementById(`assign-${scan.id}`);
                            handleAssignDoctor(scan.id, sel.value);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
