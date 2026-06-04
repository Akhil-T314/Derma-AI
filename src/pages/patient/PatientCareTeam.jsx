import React from "react";
import { motion } from "framer-motion";
import { Users, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";

export default function PatientCareTeam() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Care Team</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Professional specialists managing your dermatological health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PRIMARY DOCTOR */}
        <div className="md:col-span-2">
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white ring-1 ring-slate-900/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Users className="w-48 h-48" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-200">
                {user?.doctor_name ? "DR" : "??"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">Assigned Specialist</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user?.doctor_name || "Awaiting Clinical Assignment"}</h2>
                <p className="text-slate-500 font-medium mt-1">Dermatological Oncology & Early Lesion Detection</p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Board Certified
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-500" /> Mon-Fri Availability
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button disabled={!user?.doctor_name} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                <Mail className="w-4 h-4" /> Secure Clinical Message
              </Button>
              <Button variant="outline" className="border-slate-100 font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                <Phone className="w-4 h-4" /> Request Call-back
              </Button>
            </div>
          </Card>
        </div>

        {/* PRACTICE INFO */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-sm rounded-2xl bg-slate-50 ring-1 ring-slate-900/5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Practice Protocols</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                   <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Response time for clinical messages is typically 24-48 hours.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                   <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">All communications are encrypted and HIPAA compliant.</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

// Minimal imports for the boilerplate to work
import { Clock } from "lucide-react";
