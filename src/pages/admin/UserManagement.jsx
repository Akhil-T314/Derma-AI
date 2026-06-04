import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Search, Trash2, ShieldCheck, UserCheck, SearchX } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse p-6">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
      ))}
    </div>
  </div>
);

export default function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const token = localStorage.getItem("token") || user.id;
      
      const res = await axios.get("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Permanently delete this account and all associated medical records?")) return;
    
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const token = localStorage.getItem("token") || user.id;

      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Administration</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Audit and control access for all platform stakeholders</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search identity or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none w-80 shadow-sm transition-all"
          />
        </div>
      </div>

      <Card className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Full Name & Identity</th>
                  <th className="px-8 py-5">Clinical Role</th>
                  <th className="px-8 py-5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-gray-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-100 transition-transform group-hover:scale-105">
                            {u.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{u.full_name || "N/A"}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          u.role === 'doctor' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {u.role !== 'admin' ? (
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                            >
                              <Trash2 size={14} /> DELETE ACCOUNT
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <ShieldCheck size={14} /> PROTECTED ADMIN
                            </span>
                          )}
                        </div>
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
            <p className="text-sm font-medium">No accounts found matching your query.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
