import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Save, Camera, CheckCircle2, Mail, Loader2, Award, BookOpen, Briefcase } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function DoctorProfile() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Local State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    specialization: user?.specialization || "General Dermatology",
    qualifications: user?.qualifications || "",
    license_number: user?.license_number || "",
    bio: user?.bio || "",
    profile_image_url: user?.profile_image_url || ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        specialization: user.specialization || "General Dermatology",
        qualifications: user.qualifications || "",
        license_number: user.license_number || "",
        bio: user.bio || "",
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
      alert("Professional profile updated successfully.");
    } else {
      alert("Failed to update clinical profile.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your professional credentials and clinical biography.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Synchronizing..." : "Save Professional Profile"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: PROFESSIONAL CARD */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                 <div className="w-44 h-44 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {isUploading ? (
                       <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    ) : formData.profile_image_url ? (
                       <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-6xl font-black text-slate-300">{formData.name.charAt(4)}</span>
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
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">{formData.specialization}</p>
              
              <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                 <CheckCircle2 className="w-3 h-3" /> Licensed Practitioner
              </div>

              <div className="w-full mt-10 pt-8 border-t border-slate-100 space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">License No.</span>
                    <span className="text-slate-900 font-black">{formData.license_number || "Not Set"}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Medical ID</span>
                    <span className="text-slate-900 font-black">MED-{user?.id?.slice(0, 6).toUpperCase()}</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                 <Shield className="w-4 h-4" /> System Permissions
              </h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clinical Diagnosis Write-Access
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Patient History View-Access
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL DETAILS */}
        <div className="lg:col-span-2 space-y-8">
           {/* PROFESSIONAL IDENTITY */}
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Briefcase className="w-4 h-4 text-blue-600" /> Clinical Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Board Specialization</label>
                    <select 
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    >
                       <option>Dermatologic Oncology</option>
                       <option>General Dermatology</option>
                       <option>Pediatric Dermatology</option>
                       <option>Cosmetic Dermatology</option>
                       <option>Dermatopathology</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Email</label>
                    <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center gap-3">
                       <Mail className="w-4 h-4 opacity-50" /> {user?.email}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medical License Number</label>
                    <input 
                      type="text" 
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                      placeholder="e.g. LIC-9920-NY"
                    />
                 </div>
              </div>
           </Card>

           {/* QUALIFICATIONS & BIO */}
           <Card className="p-8 border-none shadow-sm rounded-3xl bg-white ring-1 ring-slate-900/5">
              <div className="space-y-8">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                       <Award className="w-4 h-4 text-amber-500" />
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Medical Qualifications</label>
                    </div>
                    <textarea 
                      value={formData.qualifications}
                      onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none h-24 resize-none"
                      placeholder="e.g. MD - Harvard Medical School, Board Certified in Dermatology"
                    />
                 </div>

                 <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                       <BookOpen className="w-4 h-4 text-emerald-500" />
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Professional Biography</label>
                    </div>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none h-32 resize-none"
                      placeholder="Tell patients about your clinical experience and focus areas..."
                    />
                 </div>
              </div>
           </Card>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
                Note: Your professional bio and qualifications will be visible to your assigned patients to ensure clinical transparency and build patient trust.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
