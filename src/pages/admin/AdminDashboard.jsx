import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Activity, AlertTriangle, Users, Cpu, Database, HeartPulse
} from "lucide-react";
import { Card } from "../../components/ui/card";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalScans: 0, highRiskScans: 0, activeUsers: 0 });
  const [systemHealth, setSystemHealth] = useState({ status: "checking", services: {} });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const headers = { Authorization: `Bearer ${user.id}` };

      const [analyticsRes, usersRes, healthRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/analytics", { headers }),
        axios.get("http://localhost:3000/api/admin/users", { headers }),
        axios.get("http://localhost:3000/api/admin/health", { headers })
      ]);

      setStats({
        totalScans: analyticsRes.data.totalScans || 0,
        highRiskScans: analyticsRes.data.highRiskScans || 0,
        activeUsers: usersRes.data.length || 0,
      });
      setSystemHealth(healthRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Syncing platform analytics...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Clinical Analytics Center</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoring global diagnostic volume and system infrastructure</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
           <HeartPulse className={`w-5 h-5 ${systemHealth.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
           <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">System: {systemHealth.status === 'healthy' ? 'Nominal' : 'Warning'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Global Diagnostics" value={stats.totalScans} icon={<Activity />} color="blue" />
        <StatCard title="Critical Findings" value={stats.highRiskScans} icon={<AlertTriangle />} color="red" />
        <StatCard title="Active Participants" value={stats.activeUsers} icon={<Users />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-gray-100 bg-white shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <h3 className="text-md font-bold text-gray-900 mb-8 flex items-center gap-3 relative z-10">
             <Cpu className="w-5 h-5 text-purple-600" /> AI Prediction Infrastructure
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between transition-all hover:bg-white hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                   <Cpu size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Neural Engine v2.4</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">Hybrid CNN + ViT</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Operational</span>
            </div>
            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between transition-all hover:bg-white hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                   <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Explainability Pipeline</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">Grad-CAM + XAI</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Operational</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-gray-100 bg-white shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <h3 className="text-md font-bold text-gray-900 mb-8 flex items-center gap-3 relative z-10">
             <Database className="w-5 h-5 text-blue-600" /> Data Management & Storage
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between transition-all hover:bg-white hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                   <Database size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Primary Database</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">PostgreSQL / Supabase</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Connected</span>
            </div>
            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between transition-all hover:bg-white hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                   <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Storage Bucket</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">S3 Clinical Assets</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Connected</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200",
    red: "bg-red-50 text-red-600 border-red-100 hover:border-red-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200",
  };
  
  return (
    <Card className={`p-8 bg-white border-gray-100 shadow-lg flex items-center gap-6 group transition-all rounded-3xl ${colors[color]}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 bg-white shadow-xl`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
