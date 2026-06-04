import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { UserPlus, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function ProvisionStaff() {
  const [newDocName, setNewDocName] = useState("");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocPassword, setNewDocPassword] = useState("");
  const [newDocSpec, setNewDocSpec] = useState("Dermatologic Oncology");
  const [newDocLicense, setNewDocLicense] = useState("");
  const [docMsg, setDocMsg] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDocMsg({ type: "", text: "" });
    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem("dermai_user");
      const user = JSON.parse(userStr || "{}");
      const token = localStorage.getItem("token") || user.id;

      await axios.post("http://localhost:3000/api/admin/create-doctor", 
        { 
          name: newDocName, 
          email: newDocEmail, 
          password: newDocPassword,
          specialization: newDocSpec,
          license_number: newDocLicense
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocMsg({ type: "success", text: "Medical staff account provisioned successfully. They can now log in with these credentials." });
      setNewDocName(""); setNewDocEmail(""); setNewDocPassword(""); setNewDocLicense("");
    } catch (err) {
      setDocMsg({ type: "error", text: err.response?.data?.error || "Account provisioning failed. Email may already be in use." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-12"
    >
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-100 ring-8 ring-blue-50">
          <UserPlus size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Provision Medical Staff</h1>
        <p className="text-gray-500 mt-2 font-medium">Onboard new dermatologists and clinical reviewers to the platform</p>
      </div>

      <Card className="p-10 border-gray-100 bg-white shadow-2xl rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-50" />
        
        {docMsg.text && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-4 rounded-2xl text-sm font-bold border flex items-center gap-3 ${
              docMsg.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {docMsg.type === 'success' ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0 rotate-180" />}
            {docMsg.text}
          </motion.div>
        )}

        <form onSubmit={handleCreateDoctor} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Identity Name</label>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   required 
                   value={newDocName} 
                   onChange={e => setNewDocName(e.target.value)} 
                   className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                   placeholder="Dr. Alexander Wright" 
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Clinical Email</label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="email" 
                   required 
                   value={newDocEmail} 
                   onChange={e => setNewDocEmail(e.target.value)} 
                   className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                   placeholder="alex.wright@dermai.med" 
                 />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Clinical Specialization</label>
               <select 
                 value={newDocSpec} 
                 onChange={e => setNewDocSpec(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
               >
                  <option>Dermatologic Oncology</option>
                  <option>General Dermatology</option>
                  <option>Pediatric Dermatology</option>
                  <option>Cosmetic Dermatology</option>
                  <option>Dermatopathology</option>
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Medical License Number</label>
               <div className="relative">
                 <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   required 
                   value={newDocLicense} 
                   onChange={e => setNewDocLicense(e.target.value)} 
                   className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                   placeholder="LIC-992031-NY" 
                 />
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Temporary Access Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                required 
                value={newDocPassword} 
                onChange={e => setNewDocPassword(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Generating Credentials..." : "Authorize & Create Medical Account"}
          </Button>
        </form>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed font-medium">
          <strong>Security Note:</strong> All provisioned staff accounts are created with standard doctor privileges. They will be required to update their clinical profile and verify their identification upon their first successful login.
        </p>
      </div>
    </motion.div>
  );
}
