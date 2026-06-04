import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Save, Camera, CheckCircle2, Mail, Loader2, Server, Key, Settings as SettingsIcon, User } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Local State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profile_image_url: user?.profile_image_url || ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        profile_image_url: user.profile_image_url || ""
      });
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("avatar", file);

    try {
      const res = await axios.post("http://localhost:3000/api/users/upload-avatar", uploadData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.id}`
        }
      });
      setFormData(prev => ({ ...prev, profile_image_url: res.data.imageUrl }));
      await updateProfile({ ...formData, profile_image_url: res.data.imageUrl });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    setIsSaving(false);
    if (result.success) {
      alert("Administrative profile synchronized.");
    } else {
      alert("Failed to update system profile.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Identity</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your administrative credentials and system profile.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-2"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Updating..." : "Update System Profile"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: ADMIN CARD */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-slate-900" />
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                 <div className="w-40 h-40 rounded-3xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform">
                    {isUploading ? (
                       <Loader2 className="w-10 h-10 text-slate-600 animate-spin" />
                    ) : formData.profile_image_url ? (
                       <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-6xl font-black text-slate-200">{formData.name.charAt(0)}</span>
                    )}
                 </div>
                 <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform rotate-3 group-hover:rotate-0">
                    <Camera className="w-8 h-8 text-white" />
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <h2 className="mt-8 text-2xl font-black text-slate-900">{formData.name}</h2>
              <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                 <Shield className="w-3 h-3" /> System Administrator
              </div>

              <div className="w-full mt-10 pt-8 border-t border-slate-100 space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Auth Protocol</span>
                    <span className="text-slate-900">JWT / Bearer</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Instance ID</span>
                    <span className="text-slate-900 font-mono">NODE-PRD-01</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 border-none shadow-sm rounded-3xl bg-emerald-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                 <Server className="w-4 h-4" /> Service Status
              </h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold opacity-70">Core Engine</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase">Active</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold opacity-70">ML Pipeline</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase">Online</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <User className="w-4 h-4 text-slate-900" /> Administrative Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2 lg:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Administrator Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Email</label>
                    <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center gap-3">
                       <Mail className="w-4 h-4 opacity-50" /> {user?.email}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Privilege Level</label>
                    <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center gap-3 uppercase tracking-widest text-[10px]">
                       <Shield className="w-4 h-4 opacity-50 text-slate-900" /> Full System Access
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Key className="w-4 h-4 text-slate-900" /> Security Policies
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                       <SettingsIcon className="w-5 h-5 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Audit Logging</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60">
                    <div className="flex items-center gap-3">
                       <Shield className="w-5 h-5 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Two-Factor Authentication</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Not Active</span>
                 </div>
              </div>
           </Card>

           <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 mt-1" />
              <p className="text-[11px] text-blue-800 font-bold leading-relaxed italic">
                <strong>Administrative Protocol:</strong> Changes to the system profile are logged in the global activity stream. Ensure your clinical avatar meets institutional standards for administrative representation.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
