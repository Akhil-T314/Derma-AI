import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Activity, Shield, Save, Camera, CheckCircle2, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Local State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age || 24,
    gender: user?.gender || "Female",
    profile_image_url: user?.profile_image_url || "",
    medical_history: {}
  });

  useEffect(() => {
    if (user) {
      let history = {};
      try {
        history = typeof user.medical_history === 'string' 
          ? JSON.parse(user.medical_history) 
          : (user.medical_history || {});
      } catch (e) { console.error("History parse error", e); }

      setFormData({
        name: user.name || "",
        age: user.age || 24,
        gender: user.gender || "Female",
        profile_image_url: user.profile_image_url || "",
        medical_history: history
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
      // Also trigger a profile update to sync everything
      await updateProfile({ ...formData, profile_image_url: res.data.imageUrl });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please ensure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckboxChange = (label) => {
    setFormData(prev => ({
      ...prev,
      medical_history: {
        ...prev.medical_history,
        [label]: !prev.medical_history[label]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    setIsSaving(false);
    if (result.success) {
      alert("Profile synchronized successfully.");
    } else {
      alert("Synchronization failed. Ensure you restarted the backend terminal.");
    }
  };

  const clinicalFactors = [
    { label: "Family history of skin cancer", risk: "Critical" },
    { label: "Personal history of atypical moles", risk: "High" },
    { label: "History of severe sunburns", risk: "Moderate" },
    { label: "Use of immunosuppressants", risk: "Clinical" },
    { label: "Frequent UV exposure (Outdoor)", risk: "Environmental" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* PROFESSIONAL TOP NAV */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your identity and clinical risk factors.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="font-bold text-slate-500">Discard</Button>
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Synchronize Profile"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: IDENTITY */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                 <div className="w-40 h-40 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {isUploading ? (
                       <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    ) : formData.profile_image_url ? (
                       <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-5xl font-black text-slate-300">{formData.name.charAt(0)}</span>
                    )}
                 </div>
                 <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="w-8 h-8 text-white" />
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   className="hidden" 
                   accept="image/*"
                 />
              </div>
              <h2 className="mt-6 text-2xl font-black text-slate-900">{formData.name}</h2>
              <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                 <CheckCircle2 className="w-3 h-3" /> Identity Verified
              </div>
              <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Record Number</p>
              <p className="text-sm font-black text-slate-900">MRN-{user?.id?.slice(0, 8).toUpperCase()}</p>
           </Card>

           <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Security Overview</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="opacity-60">2FA Status</span>
                    <span className="text-amber-400">Not Configured</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="opacity-60">Last Login</span>
                    <span>Today, 10:24 AM</span>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: DATA */}
        <div className="lg:col-span-2 space-y-8">
           {/* BIOLOGICAL DATA */}
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <User className="w-4 h-4 text-blue-600" /> Basic Biological Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registered Email</label>
                    <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center gap-3">
                       <Mail className="w-4 h-4 opacity-50" /> {user?.email}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Age</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Biological Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    >
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                    </select>
                 </div>
              </div>
           </Card>

           {/* MEDICAL HISTORY */}
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-600" /> Clinical Risk Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {clinicalFactors.map((item, i) => (
                   <label key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-50 hover:bg-slate-50 hover:border-slate-200 cursor-pointer transition-all group">
                      <div className="mt-1">
                         <input 
                           type="checkbox" 
                           checked={!!formData.medical_history[item.label]}
                           onChange={() => handleCheckboxChange(item.label)}
                           className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-100" 
                         />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800">{item.label}</p>
                         <span className="text-[10px] font-black uppercase text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.risk} Importance</span>
                      </div>
                   </label>
                 ))}
              </div>
           </Card>

           {/* DATA PROTECTION NOTICE */}
           <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <Shield className="w-10 h-10 text-emerald-600 shrink-0" />
              <div>
                 <h4 className="text-sm font-black text-emerald-900">HIPAA Compliant Data Handling</h4>
                 <p className="text-[11px] text-emerald-700 font-medium">Your medical history and biological data are encrypted using AES-256 protocols and are only shared with your assigned clinical specialist.</p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
